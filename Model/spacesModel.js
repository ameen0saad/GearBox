const mongoose = require('mongoose');
const slugify = require('slugify');

const spaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Space must have a name'],
      unique: true,
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
    imageCover: {
      type: String,
      required: [true, 'Spaces must have images'],
    },
    images: {
      type: [String],
    },
    available: {
      type: Boolean,
    },
    price: {
      type: Number,
      required: [true, 'Space must have a price'],
    },
    slug: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

spaceSchema.index({ slug: 1 });

spaceSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

spaceSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'reviewable',
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
