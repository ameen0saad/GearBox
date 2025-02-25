const Space = require('../Model/spacesModel');
const ApiFeatures = require('../utils/apiFeatures');
exports.getAllSpaces = async (req, res, next) => {
  try {
    const features = new ApiFeatures(Space.find(), req.query)
      .sort()
      .limitField()
      .filter()
      .paginate();
    const spaces = await features.query;
    res.status(200).json({
      results: spaces.length,
      status: 'success',
      data: {
        spaces,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getSpace = async (req, res, next) => {
  const space = await Space.findById(req.params.id);
  try {
    res.status(200).json({
      Status: 'success',
      data: {
        space,
      },
    });
  } catch (err) {
    res.status(404).json({
      Status: 'fail',
      message: err.message,
    });
  }
};

exports.createSpace = async (req, res, next) => {
  const newSpace = await Space.create(req.body);
  try {
    res.status(201).json({
      Status: 'success',
      data: {
        space: newSpace,
      },
    });
  } catch (err) {
    res.status(404).json({
      Status: 'fail',
      message: err.message,
    });
  }
};

exports.updateSpace = async (req, res, next) => {
  try {
    const space = await Space.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        space,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.deleteSpace = async (req, res, next) => {
  await Space.findByIdAndDelete(req.params.id);
  try {
    res.status(204).json({
      Status: 'success',
    });
  } catch (err) {
    res.status(404).json({
      Status: 'fail',
      message: err.message,
    });
  }
};
