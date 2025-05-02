const mongoose = require('mongoose');
const validator = require('validator');
const bcrybt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please enter your password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      validator: function (ele) {
        return ele === this.password;
      },
      message: 'passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetOTP: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrybt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.correctPassword = async (candidatePassword, userPassword) =>
  await bcrybt.compare(candidatePassword, userPassword);

userSchema.methods.changedPasswordAfter = (JWTTimestamp) => {
  if (this.passwordChangedAt) {
    const changedPassword = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedPassword;
  }
  return false;
};

userSchema.methods.createPasswordResetOTP = function () {
  // 1) Generate OTP (6-digit random number)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 2) Hash the OTP and save it in the database
  this.passwordResetOTP = crypto.createHash('sha256').update(otp).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiration

  // 3) Return the plain OTP to send to the user (unhashed)
  return otp;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
