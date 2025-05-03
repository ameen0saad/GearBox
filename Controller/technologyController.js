const multer = require('multer');
const sharp = require('sharp');
const Technology = require('../Model/technoModel');
const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

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

exports.uploadTechnologyImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

exports.resizeTechnologyImages = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.imageCover || !req.files.images) return next();

  const technologyId = req.params.id || 'new';
  req.body.imageCover = `technology-${technologyId}-${Date.now()}.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/technologys/${req.body.imageCover}`);

  // Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `technology-${technologyId}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/technologys/${filename}`);
      req.body.images.push(filename);
    })
  );
  next();
});

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
