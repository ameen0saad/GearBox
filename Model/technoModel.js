const mongoose = require('mongoose');

const technoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Technology must have a name'],
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
  image: {
    type: String,
    required: [true, 'Technologies must have images'],
  },
  available: {
    type: Boolean,
  },
});
const Technology = mongoose.model('Technology', technoSchema);
module.exports = Technology;
