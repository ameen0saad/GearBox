const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user'],
  },
  booking: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'booking must belong to a Space or customeBooking'],
    refPath: 'onModel',
  },
  onModel: {
    type: String,
    required: true,
    enum: ['Package', 'CustomeBooking'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price'],
  },
  deliveryDate: {
    type: Date,
    default: null,
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'booking',
    select: 'name',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
