const mongoose = require('mongoose');
const slugify = require('slugify');

const technoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Technology must have a name'],
    minlength: [5, 'Technology name must be at least 5 characters'],
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Technology must have a description'],
  },
  price: {
    type: Number,
    required: [true, 'Technology must have a price'],
  },
  ratingsAverage: {
    type: Number,
  },
  ratingsQuantity: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price;
      },
      message: 'A discount price {VALUE} must be below the original price',
    },
  },
  imageCover: {
    type: String,
    required: [true, 'Technologies must have images'],
  },
  images: [String],
  available: {
    type: Boolean,
  },
  slug: String,
});
technoSchema.index({ slug: 1 });
technoSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
const Technology = mongoose.model('Technology', technoSchema);
module.exports = Technology;
