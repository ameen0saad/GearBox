const Review = require('../Model/reviewModel');
const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.setSpaceOrPackageUserIds = (req, res, next) => {
  if (req.baseUrl.match(/spaces/)) {
    if (!req.body.user) req.body.user = req.user.id;
    if (!req.body.space) req.body.reviewable = req.params.spaceId;
    req.body.onModel = 'Space';
  }
  if (req.baseUrl.match(/packages/)) {
    if (!req.body.user) req.body.user = req.user.id;
    if (!req.body.package) req.body.reviewable = req.params.packageId;
    req.body.onModel = 'Package';
  }

  next();
};

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.spaceId) filter = { reviewable: req.params.spaceId };
  if (req.params.packageId) filter = { reviewable: req.params.packageId };
  const features = new ApiFeatures(Review.find(filter), req.query)
    .filter()
    .sort()
    .paginate()
    .limitField();
  const reviews = await features.query;
  res.status(200).json({
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('No review found with that ID', 404));
  res.status(200).json({
    status: 'Success',
    data: {
      review,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const review = await Review.create(req.body);

  res.status(201).json({
    Status: 'success',
    data: {
      review: review,
    },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  if (!review) return next(new AppError('No space found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return next(new AppError('No space found with that ID', 404));

  res.status(204).json({
    Status: 'success',
  });
});
