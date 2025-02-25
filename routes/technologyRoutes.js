const express = require('express');
const router = express.Router();
const technologyController = require('../Controller/technologyController');

router
  .route('/')
  .get(technologyController.getAllTechnologies)
  .post(technologyController.createTechnology);
router
  .route('/:id')
  .get(technologyController.getTechnology)
  .patch(technologyController.updateTechnology)
  .delete(technologyController.deleteTechnology);
module.exports = router;
