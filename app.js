var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var mongoose = require('mongoose');

// Nhúng các file routes
var indexRouter = require('./routes/index');
var productRouter = require('./routes/products');
var categoryRouter = require('./routes/categories');
var userRouter = require('./routes/users');
var billRouter = require('./routes/bills');
var adminRouter = require('./routes/admin');
var metadataRouter = require('./routes/metadata');
var { router: cartRouter } = require('./routes/cart');
var paymentRouter = require('./routes/payment');

var app = express();

// Kết nối database MongoDB theo đúng hướng dẫn Google Doc bài giảng
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/3caidonhua';
mongoose.connect(MONGO_URI)
  .then(() => console.log('>>>>>>>>>> DB Connected!!!!!! (MongoDB: ' + MONGO_URI + ')'))
  .catch(err => console.log('>>>>>>>>> DB Error: ', err));

// Cấu hình CORS theo đúng hướng dẫn Google Doc bài giảng
var corsOptionsDelegate = function (req, callback) {
  var corsOptions = { origin: true, credentials: true };
  callback(null, corsOptions);
};
app.use(cors(corsOptionsDelegate));

// View engine setup (hbs)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Đăng ký sử dụng routes (hỗ trợ cả chuẩn bài giảng và chuẩn frontend SPA)
app.use('/', indexRouter);
app.use('/products', productRouter);
app.use('/api/products', productRouter);
app.use('/categories', categoryRouter);
app.use('/api/categories', categoryRouter);
app.use('/users', userRouter);
app.use('/api/users', userRouter);
app.use('/auth', userRouter);
app.use('/api/auth', userRouter);
app.use('/bills', billRouter);
app.use('/api/bills', billRouter);
app.use('/orders', billRouter);
app.use('/api/orders', billRouter);
app.use('/admin', adminRouter);
app.use('/api/admin', adminRouter);
app.use('/metadata', metadataRouter);
app.use('/api/metadata', metadataRouter);
app.use('/cart', cartRouter);
app.use('/api/cart', cartRouter);
app.use('/payment', paymentRouter);
app.use('/api/payment', paymentRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
