const express = require('express');
const contactController = require('../Controller/contactController');
const authController = require('../Controller/authController');

const router = express.Router();

router.post('/',contactController.createContct);

router.use(authController.protect, authController.restrictTo('admin'));
router.route('/').get(contactController.getAllContact);
router
  .route('/:id')
  .get(contactController.getContact)
  .patch(contactController.updateContact)
  .delete(contactController.deleteContact);

module.exports = router;
