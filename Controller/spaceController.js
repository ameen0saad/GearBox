const multer = require('multer');
const sharp = require('sharp');

const Space = require('../Model/spacesModel');
const Booking = require('../Model/bookingModel');
const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

exports.uploadSpaceImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

exports.resizeSpaceImages = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.imageCover || !req.files.images) return next();

  const spaceId = req.params.id || 'new';
  req.body.imageCover = `space-${spaceId}-${Date.now()}.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/spaces/${req.body.imageCover}`);

  // Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `space-${spaceId}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/spaces/${filename}`);
      req.body.images.push(filename);
    })
  );
  next();
});
exports.getSpaceStatus = catchAsync(async (req, res, next) => {
  const result = await Booking.aggregate([
    // 1. CustomeBooking bookings
    {
      $match: { onModel: 'CustomeBooking' },
    },
    {
      $lookup: {
        from: 'customebookings',
        localField: 'booking',
        foreignField: '_id',
        as: 'cb',
      },
    },
    { $unwind: '$cb' },
    {
      $project: {
        space: '$cb.space',
        price: 1,
      },
    },

    // 2. Union with Package bookings
    {
      $unionWith: {
        coll: 'bookings',
        pipeline: [
          { $match: { onModel: 'Package' } },
          {
            $lookup: {
              from: 'packages',
              localField: 'booking',
              foreignField: '_id',
              as: 'pkg',
            },
          },
          { $unwind: '$pkg' },
          // هنا استخدم pkg.space مباشرة مش pkg.spaces
          {
            $project: {
              space: '$pkg.space', // بدل pkg.spaces لأن pkg.space هو ObjectId
              price: 1,
            },
          },
        ],
      },
    },

    // 3. Group by space
    {
      $group: {
        _id: '$space',
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$price' },
      },
    },

    // 4. Lookup space details
    {
      $lookup: {
        from: 'spaces',
        localField: '_id',
        foreignField: '_id',
        as: 'space',
      },
    },
    { $unwind: '$space' },

    // 5. Project final output
    {
      $project: {
        _id: 0,
        spaceId: '$space._id',
        spaceName: '$space.name',
        totalBookings: 1,
        totalRevenue: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      result,
    },
  });
});
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
