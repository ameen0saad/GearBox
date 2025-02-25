const Technology = require('../Model/technoModel');
const ApiFeatures = require('../utils/apiFeatures');

// TODO : Get All Technologies
exports.getAllTechnologies = async (req, res) => {
  try {
    const features = new ApiFeatures(Technology.find(), req.query)
      .filter()
      .limitField()
      .sort()
      .paginate();
    const technology = await features.query;
    res.status(200).json({
      Status: 'Success',
      result: technology.length,
      data: {
        technology,
      },
    });
  } catch (err) {
    res.status(404).json({
      Status: 'Fail',

      message: { Error: err.message },
    });
  }
};

// TODO : Get Technology
exports.getTechnology = async (req, res) => {
  try {
    const technology = await Technology.findById();
    res.status(200).json({
      status: 'Success',
      data: {
        technology,
      },
    });
  } catch (err) {
    res.status(404).json({
      Status: 'Fail',
      message: { Error: err.message },
    });
  }
};

// TODO : Create Technology
exports.createTechnology = async (req, res) => {
  try {
    const newTechnology = await Technology.create(req.body);
    res.status(201).json({
      status: 'Success',
      data: {
        technology: newTechnology,
      },
    });
  } catch (err) {
    res.status(404).json({
      Status: 'Fail',
      message: { Error: err.message },
    });
  }
};
// TODO : Update Technology
exports.updateTechnology = async (req, res) => {
  try {
    const technology = await Technology.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );
    res.status(200).json({
      status: 'Success',
      data: {
        technology: technology,
      },
    });
  } catch (err) {
    res.status(404).json({
      Status: 'Fail',
      message: { Error: err.message },
    });
  }
};
// TODO : Delete Technology
exports.deleteTechnology = async (req, res) => {
  try {
    await Technology.findByIdAndDelete(req.params.id);
    res.status(204).json({
      Status: 'success',
      data: 'no content',
    });
  } catch (err) {
    res.status(404).json({
      Status: 'Fail',
      message: { Error: err.message },
    });
  }
};
