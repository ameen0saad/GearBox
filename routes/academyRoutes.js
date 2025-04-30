const express = require('express');
const academyController = require('../Controller/academyController');
const authController = require('../Controller/authController');

const router = express.Router();
router.post('/', academyController.createAcademy);

router.use(authController.protect, authController.restrictTo('admin'));

router.route('/').get(academyController.getAllAcademy);
router
  .route('/:id')
  .get(academyController.getAcademy)
  .patch(academyController.updateAcademy)
  .delete(academyController.deleteAcademy);
module.exports = router;
