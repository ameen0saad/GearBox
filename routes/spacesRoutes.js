const express = require('express');

const router = express.Router();

const spaceController = require('../Controller/spaceController');

router
  .route('/')
  .get(spaceController.getAllSpaces)
  .post(spaceController.createSpace);
router
  .route('/:id')
  .get(spaceController.getSpace)
  .patch(spaceController.updateSpace)
  .delete(spaceController.deleteSpace);

module.exports = router;
