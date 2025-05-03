const express = require('express');

const technologyController = require('../Controller/technologyController');
const authController = require('../Controller/authController');

const router = express.Router();
router.route('/').get(technologyController.getAllTechnologies).post(
  authController.protect,
  authController.restrictTo('admin'),
  technologyController.uploadTechnologyImages,
  technologyController.resizeTechnologyImages,

  technologyController.createTechnology
);
router
  .route('/:id')
  .get(technologyController.getTechnology)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    technologyController.uploadTechnologyImages,
    technologyController.resizeTechnologyImages,
    technologyController.updateTechnology
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    technologyController.deleteTechnology
  );
module.exports = router;
