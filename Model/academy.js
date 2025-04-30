const mongoose = require('mongoose');
const validator = require('validator');

const academySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide a phone number!'],
  },
  courses: {
    type: String,
    required: [true, 'Please provide the courses you are interested in!'],
  },
});

const Academy = mongoose.model('Academy', academySchema);
module.exports = Academy;
