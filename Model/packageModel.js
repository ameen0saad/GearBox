const mongoose = require('mongoose');
const slugify = require('slugify');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A package must have a name'],
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'A package must have a description'],
  },
  price: {
    type: Number,
    required: [true, 'A package must have a price'],
  },
  space: {
    type: mongoose.Schema.ObjectId,
    ref: 'Space',
    required: [true, 'A package must belong to a space'],
  },
  Technology: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Technology',
      required: [true, 'A package must belong to a technology'],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
packageSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

packageSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'space',
    select: 'name images',
  }).populate({
    path: 'Technology',
    select: 'name images',
  });
  next();
});

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
