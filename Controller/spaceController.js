const Space = require('../Model/spacesModel');
const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// TODO : Get all spaces
exports.getAllSpaces = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Space.find(), req.query)
    .sort()
    .limitField()
    .filter()
    .paginate();
  const spaces = await features.query;

  res.status(200).json({
    results: spaces.length,
    status: 'success',
    data: {
      spaces,
    },
  });
});

// TODO : Get a single space
exports.getSpace = catchAsync(async (req, res, next) => {
  const space = await Space.findById(req.params.id);
  if (!space) return next(new AppError('No space found with that ID', 404));

  res.status(200).json({
    Status: 'success',
    data: {
      space,
    },
  });
});

// TODO : Create a space
exports.createSpace = catchAsync(async (req, res, next) => {
  const newSpace = await Space.create(req.body);

  res.status(201).json({
    Status: 'success',
    data: {
      space: newSpace,
    },
  });
});

// TODO : Update a space
exports.updateSpace = catchAsync(async (req, res, next) => {
  const space = await Space.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  if (!space) return next(new AppError('No space found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      space,
    },
  });
});

// TODO : Delete a space
exports.deleteSpace = catchAsync(async (req, res, next) => {
  const space = await Space.findByIdAndDelete(req.params.id);
  if (!space) return next(new AppError('No space found with that ID', 404));

  res.status(204).json({
    Status: 'success',
  });
});
