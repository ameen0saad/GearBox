const multer = require('multer');
const sharp = require('sharp');
const Package = require('../Model/packageModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPackageImages = upload.single('imageCover');

exports.resizePackageImages = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.body.imageCover = `package-${req.params.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/packages/${req.body.imageCover}`);
  next();
});

// TODO : Get all academies
exports.getAllPackage = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Package.find(), req.query)
    .sort()
    .limitField()
    .filter()
    .paginate();
  const package = await features.query;

  res.status(200).json({
    status: 'success',
    results: package.length,
    data: {
      package,
    },
  });
});

// TODO : Get a single Package
exports.getPackage = catchAsync(async (req, res, next) => {
  const package = await Package.findById(req.params.id);
  if (!package) return next(new AppError('No Package found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: { package },
  });
});

// TODO : Create a new Package
exports.createPackage = catchAsync(async (req, res, next) => {
  const newPackage = await Package.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      package: newPackage,
    },
  });
});

// TODO : Update an Package
exports.updatePackage = catchAsync(async (req, res, next) => {
  const package = await Package.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  if (!package) return next(new AppError('No Package found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: { package },
  });
});

// TODO : Delete an Package
exports.deletePackage = catchAsync(async (req, res, next) => {
  const package = await Package.findByIdAndDelete(req.params.id);
  if (!package) return next(new AppError('No Package found with that ID', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
