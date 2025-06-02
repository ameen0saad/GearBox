const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const CustomeBooking = require('../Model/customeBooking');
const Space = require('../Model/spacesModel');

exports.createCustomeBooking = catchAsync(async (req, res, next) => {
  const { space, technology, date, price } = req.body;
  const user = req.user.id; // Assuming you have user ID in req.user

  // Check if the space and technology exist
  const spaceExists = await Space.findById(space);

  if (!spaceExists) {
    return next(new AppError('Space not found', 404));
  }
  console.log('spaceExists', spaceExists);
  if (spaceExists.available === false) {
    return next(new AppError('This space is not available for booking', 400));
  }
  // Create the booking
  const booking = await CustomeBooking.create({
    user,
    space,
    technology,
    date,
    price,
  });

  res.status(201).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

exports.getAllCustomeBookings = catchAsync(async (req, res, next) => {
  const customebookings = await CustomeBooking.find({ paid: false });
  res.status(200).json({
    status: 'success',
    results: customebookings.length,
    data: {
      customebookings,
    },
  });
});
exports.deleteCustomeBooking = catchAsync(async (req, res, next) => {
  const booking = await CustomeBooking.findByIdAndDelete(req.params.id);
  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMyCustomeBookings = catchAsync(async (req, res, next) => {
  const customeBookings = await CustomeBooking.find({ user: req.user.id });
  res.status(200).json({
    status: 'success',
    results: customeBookings.length,
    data: {
      customeBookings,
    },
  });
});
