const Technology = require('../Model/technoModel');
const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// TODO : Get All Technologies
exports.getAllTechnologies = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Technology.find(), req.query)
    .filter()
    .limitField()
    .sort()
    .paginate();
  const technology = await features.query;

  res.status(200).json({
    Status: 'Success',
    result: technology.length,
    data: {
      technology,
    },
  });
});

// TODO : Get Technology
exports.getTechnology = catchAsync(async (req, res, next) => {
  const technology = await Technology.findById(req.params.id);
  if (!technology)
    return next(new AppError('No technology found with that ID', 404));

  res.status(200).json({
    status: 'Success',
    data: {
      technology,
    },
  });
});

// TODO : Create Technology
exports.createTechnology = catchAsync(async (req, res, next) => {
  const newTechnology = await Technology.create(req.body);
  res.status(201).json({
    status: 'Success',
    data: {
      technology: newTechnology,
    },
  });
});
// TODO : Update Technology
exports.updateTechnology = catchAsync(async (req, res, next) => {
  const technology = await Technology.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      runValidators: true,
      new: true,
    }
  );
  if (!technology)
    return next(new AppError('No technology found with that ID', 404));

  res.status(200).json({
    status: 'Success',
    data: {
      technology: technology,
    },
  });
});
// TODO : Delete Technology
exports.deleteTechnology = catchAsync(async (req, res, next) => {
  const technology = await Technology.findByIdAndDelete(req.params.id);
  if (!technology)
    return next(new AppError('No technology found with that ID', 404));

  res.status(204).json({
    Status: 'success',
    data: 'no content',
  });
});
