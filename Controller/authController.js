const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');

const Email = require('../utils/email');
const User = require('../Model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);
  res.status(statusCode).json({
    status: 'Success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //TODO : 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  //TODO : 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError('invalid email or password please try again', 401)
    );
  }
  //TODO :  3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // TODO : 1) Getting Token and check if it there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError('You are not Logged in! please log in to get access', 401)
    );

  // TODO : 2) Verification Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  if (!decoded) return next(new AppError(' verification token not valid', 401));
  // TODO : 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError(
        'The user belonging to this token does no longer exits.',
        401
      )
    );

  // TODO : 4) Check if the password has been changed after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('user recently changed password please log in again.', 401)
    );
  }
  // TODO : Grant access to protected route

  req.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return next(new AppError('There is no user with this email address', 404));

  // TODO : Generate the random OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // TODO : Hash the OTP and set it to the user schema
  user.passwordResetOTP = crypto.createHash('sha256').update(otp).digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  try {
    await new Email(user, otp).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'OTP sent to email!',
    });
  } catch (err) {
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error, please try again later', 500)
    );
  }
});

exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    passwordResetOTP: hashedOTP,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Invalid or expired OTP', 400));

  user.allowPasswordReset = true;
  await user.save({ validateBeforeSave: false });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '10m',
  });

  res.status(200).json({
    status: 'success',
    message: 'OTP verified',
    token,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  let decoded;
  try {
    decoded = jwt.verify(
      req.headers.authorization.split(' ')[1],
      process.env.JWT_SECRET
    );
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }

  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError('User not found', 404));

  if (!user.allowPasswordReset)
    return next(new AppError('Password reset not allowed', 403));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetOTP = undefined;
  user.passwordResetExpires = undefined;
  user.allowPasswordReset = false;

  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // TODO : get user from collection
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(new AppError('please log in to update your password', 404));
  }
  // TODO : check if the current password is correct
  const { passwordCurrent, newPassword, passwordConfirm } = req.body;

  if (!(await user.correctPassword(passwordCurrent, user.password)))
    return next(new AppError('Invalid password please try again', 401));

  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  // TODO : Log user in and send JWT
  createSendToken(user, 200, res);
});
