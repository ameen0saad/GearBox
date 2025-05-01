const express = require('express');
const spaceController = require('../Controller/spaceController');
const authController = require('../Controller/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router
  .route('/')
  .get(spaceController.getAllSpaces)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    spaceController.createSpace
  );
router
  .route('/:id')
  .get(spaceController.getSpace)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    spaceController.updateSpace
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    spaceController.deleteSpace
  );

router.use('/:spaceId/reviews', reviewRouter);
module.exports = router;
