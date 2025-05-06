const express = require('express');
const customeBookingController = require('../Controller/customeBookingController');
const authController = require('../Controller/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .post(customeBookingController.createCustomeBooking)
  .get(customeBookingController.getAllCustomeBookings); // Create a new custome booking
router.route('/:id').post(customeBookingController.deleteCustomeBooking); // Create a new custome booking
module.exports = router;
