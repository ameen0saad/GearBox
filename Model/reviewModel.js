const mongoose = require('mongoose');

const Package = require('./packageModel');
const Space = require('./spacesModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    reviewable: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Review must belong to a Space or Package'],
      refPath: 'onModel',
    },
    onModel: {
      type: String,
      required: true,
      enum: ['Space', 'Package'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ reviewable: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (
  reviewableId,
  onModel
) {
  const stats = await this.aggregate([
    {
      $match: { reviewable: reviewableId, onModel },
    },
    {
      $group: {
        _id: '$reviewable',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const Model = onModel === 'Space' ? Space : Package;

  if (stats.length > 0) {
    await Model.findByIdAndUpdate(reviewableId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Model.findByIdAndUpdate(reviewableId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.reviewable, this.onModel);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calcAverageRatings(
      this.r.reviewable,
      this.r.onModel
    );
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
