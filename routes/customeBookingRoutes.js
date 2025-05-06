const express = require('express');
const customeBookingController = require('../Controller/customeBookingController');
const authController = require('../Controller/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .post(customeBookingController.createCustomeBooking)
  .get(customeBookingController.getAllCustomeBookings);

router.get(
  '/my-custome-bookings',
  customeBookingController.getMyCustomeBookings
); // Get all custome bookings for the logged in user
router.route('/:id').post(customeBookingController.deleteCustomeBooking); // Create a new custome booking
module.exports = router;
