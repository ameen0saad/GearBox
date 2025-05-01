const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Contact = require('../Model/contact');
const ApiFeatures = require('../utils/apiFeatures');

// TODO : Get all contacts
exports.getAllContact = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Contact.find(), req.query)
    .sort()
    .limitField()
    .filter()
    .paginate();
  const contact = await features.query;

  res.status(200).json({
    status: 'success',
    results: contact.length,
    data: {
      contact,
    },
  });
});

// TODO : Get a single contact
exports.getContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) return next(new AppError('No contact found with that ID', 404));
  res.status(200).json({
    status: 'success',
    data: { contact },
  });
});

// TODO : Create a new contact
exports.createContct = catchAsync(async (req, res, next) => {
  const newContact = await Contact.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      contact: newContact,
    },
  });
});

// TODO : Update a contact
exports.updateContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  if (!contact) return next(new AppError('No contact found with that ID', 404));
  res.status(200).json({
    status: 'success',
    data: { contact },
  });
});

// TODO : Delete a contact
exports.deleteContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) return next(new AppError('No contact found with that ID', 404));
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
