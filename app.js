const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controller/errorController');
const technologyRouter = require('./routes/technologyRoutes');
const spacesRouter = require('./routes/spacesRoutes');
const academyRouter = require('./routes/academyRoutes');
const contactRouter = require('./routes/contactRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();
app.use(cors());

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
app.use('/api/v1/users', userRouter);
// app.use('/api/v1/reviews');
app.use('/api/v1/technology', technologyRouter);
app.use('/api/v1/academy', academyRouter);
app.use('/api/v1/contact', contactRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
