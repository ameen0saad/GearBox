const mongoose = require('mongoose');
const Space = require('./spacesModel');
const Technology = require('./technoModel');

const customeBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user'],
  },
  space: {
    type: mongoose.Schema.ObjectId,
    ref: 'Space',
    required: [true, 'Booking must belong to a space'],
  },
  technology: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Technology',
      required: [true, 'Booking must have a technology'],
    },
  ],
  date: {
    type: Date,
    required: [true, 'Booking must have a date'],
  },
  price: {
    type: Number,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
customeBookingSchema.pre('save', async function (next) {
  const space = await Space.findById(this.space);

  const technologyDocs = await Promise.all(
    this.technology.map((techId) => Technology.findById(techId))
  );

  //   const technologyPrice = await Technology.aggregate([
  //     { $match: { _id: { $in: technologyIds } } },
  //     { $group: { _id: null, totalPrice: { $sum: '$price' } } },
  //   ]);

  const technologyTotalPrice = technologyDocs.reduce(
    (acc, tech) => acc + tech.price,
    0
  );

  this.price = space.price + technologyTotalPrice;
  next();
});
customeBookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'space',
    select: 'name imageCover',
  }).populate({
    path: 'technology',
    select: 'name imageCover',
  });
  next();
});

const customeBooking = mongoose.model('CustomeBooking', customeBookingSchema);
module.exports = customeBooking;
