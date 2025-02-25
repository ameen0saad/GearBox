const express = require('express');
const app = express();
const morgan = require('morgan');
const technologyRouter = require('./routes/technologyRoutes');
const spacesRouter = require('./routes/spacesRoutes');
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
app.use('/api/v1/spaces', spacesRouter);
// app.use('/api/v1/user');
// app.use('/api/v1/reviews');
app.use('/api/v1/technology', technologyRouter);
module.exports = app;
