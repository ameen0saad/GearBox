const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Package = require('../Model/packageModel');
const Booking = require('../Model/bookingModel');
const customeBooking = require('../Model/customeBooking');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getCheckoutSessionPackage = catchAsync(async (req, res, next) => {
  const package = await Package.findById(req.params.packageId);
  if (!package) return next(new AppError('No package found with that ID', 404));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/api/v1/bookings/my-book/?package=${req.params.packageId}&user=${req.user._id}&price=${package.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/package/${package.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.packageId,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: package.price * 100,
          product_data: {
            name: `${package.name} package`,
            description: package.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/packages/${package.imageCover}`,
            ],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.getCheckoutSessionCustome = catchAsync(async (req, res, next) => {
  const custome = await customeBooking.findById(req.params.customeId);
  if (!custome) return next(new AppError('No custome found with that ID', 404));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/api/v1/bookings/my-book/?custome=${req.params.customeId}&user=${req.user._id}&price=${custome.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/custome/custome-test`,
    customer_email: req.user.email,
    client_reference_id: req.params.customeId,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: custome.price * 100,
          product_data: {
            name: `${custome.space.name}`,
            description: custome.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/spaces/${custome.space.imageCover}`,
            ],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { package, user, price, custome } = req.query;
  if (custome) {
    await Booking.create({
      user,
      booking: custome,
      onModel: 'CustomeBooking',
      price,
    });
  }

  if (package) {
    await Booking.create({
      user,
      booking: package,
      onModel: 'Package',
      price,
    });
  }
  res.redirect('http://localhost:5173');
});

exports.getAllUserBookings = catchAsync(async (req, res, next) => {
  const packages = await Booking.find({ user: req.user.id });

  if (!packages)
    return next(new AppError('No package found with that ID', 404));
  res.status(200).json({
    status: 'success',
    result: packages.length,
    data: {
      packages,
    },
  });
});

exports.getAllBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find();
  res.status(200).json({
    status: 'success',
    result: bookings.length,
    data: {
      bookings,
    },
  });
});

exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('No booking found with that ID', 404));
  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

exports.createBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

exports.updateBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!booking) return next(new AppError('No booking found with that ID', 404));
  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

exports.deleteBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) return next(new AppError('No booking found with that ID', 404));
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const packageId = session.client_reference_id;
    const userId = session.customer_email;
    const price = session.amount_total / 100;
    await Booking.create({
      user: userId,
      package: packageId,
      price,
    });
  }
  res.status(200).json({ received: true });
});
