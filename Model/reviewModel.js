const mongoose = require('mongoose');

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
      default: Date.now(),
    },
    space: {
      type: mongoose.Schema.ObjectId,
      ref: 'Space',
      required: [true, 'Review must belong to a tour'],
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
/*
reviewSchema.index({ space: 1, user: 1 }, { unique: true });
*/
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (spaceId) {
  const stats = await this.aggregate([
    {
      $match: { space: spaceId },
    },
    {
      $group: {
        _id: '$space',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Space.findByIdAndUpdate(spaceId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Space.findByIdAndUpdate(spaceId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.space);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.space);
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
