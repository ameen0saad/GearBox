const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Academy = require('../Model/academy');
const ApiFeatures = require('../utils/apiFeatures');

// TODO : Get all academies
exports.getAllAcademy = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Academy.find(), req.query)
    .sort()
    .limitField()
    .filter()
    .paginate();
  const academy = await features.query;

  res.status(200).json({
    status: 'success',
    results: academy.length,
    data: {
      academy,
    },
  });
});

// TODO : Get a single academy
exports.getAcademy = catchAsync(async (req, res, next) => {
  const academy = await Academy.findById(req.params.id);
  if (!academy) return next(new AppError('No academy found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: { academy },
  });
});

// TODO : Create a new academy
exports.createAcademy = catchAsync(async (req, res, next) => {
  const newAcademy = await Academy.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      academy: newAcademy,
    },
  });
});

// TODO : Update an academy
exports.updateAcademy = catchAsync(async (req, res, next) => {
  const academy = await Academy.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  if (!academy) return next(new AppError('No academy found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: { academy },
  });
});

// TODO : Delete an academy
exports.deleteAcademy = catchAsync(async (req, res, next) => {
  const academy = await Academy.findByIdAndDelete(req.params.id);
  if (!academy) return next(new AppError('No academy found with that ID', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
