const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Space must have a name'],
    },
    description: {
      type: String,
      required: [true, 'Space must have a description'],
    },
    size: {
      type: String,
      required: [true, 'Space must have a size'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    ratingsAverage: {
      type: Number,
    },
    ratingsQuantity: {
      type: Number,
    },
    image: {
      type: String,
      required: [true, 'Spaces must have images'],
    },
    available: {
      type: Boolean,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

spaceSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'space',
  localField: '_id',
});

spaceSchema.pre(/^findOne/, function (next) {
  this.populate({
    path: 'reviews',
  });
  next();
});
const Space = mongoose.model('Space', spaceSchema);
module.exports = Space;
