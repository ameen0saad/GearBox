const express = require('express');
const bookingController = require('../Controller/bookingController');
const authController = require('../Controller/authController');

const router = express.Router();
router.get('/my-book', bookingController.createBookingCheckout);

router.use(authController.protect);
router.get(
  '/checkout-session-package/:packageId',
  bookingController.getCheckoutSessionPackage
);

router.get(
  '/checkout-session-custome/:customeId',
  bookingController.getCheckoutSessionCustome
);

router.get('/my-bookings', bookingController.getAllUserBookings);

router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);
module.exports = router;
