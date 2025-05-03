const express = require('express');
const authController = require('../Controller/authController');
const packageController = require('../Controller/packageController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router
  .route('/')
  .get(packageController.getAllPackage)
  .post(
    authController.protect, 
    authController.restrictTo('admin'),
    packageController.createPackage
  );
router
  .route('/:id')
  .get(packageController.getPackage)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    packageController.updatePackage
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    packageController.deletePackage
  );
router.use('/packageId/reviews', reviewRouter);
module.exports = router;
