const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controller/errorController');
const technologyRouter = require('./routes/technologyRoutes');
const spacesRouter = require('./routes/spacesRoutes');
const academyRouter = require('./routes/academyRoutes');
const contactRouter = require('./routes/contactRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const packageRouter = require('./routes/packageRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const customebookingRouter = require('./routes/customeBookingRoutes');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'Views')));

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5500'],
    credentials: true,
  })
);

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
app.use('/api/v1/technology', technologyRouter);
app.use('/api/v1/academy', academyRouter);
app.use('/api/v1/contact', contactRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/packages', packageRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/customebookings', customebookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
