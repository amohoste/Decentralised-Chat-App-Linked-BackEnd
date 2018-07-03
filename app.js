/* ------------------------- *
 *         Modules           *
 * ------------------------- */ 
var express = require('express');
const path = require('path'); // To do things with paths (file paths etc.)
const exphbs = require('express-handlebars'); // For inserting data in html code, eg. <h1>{{title}}</h1>
const methodOverride = require('method-override'); // Enables put request in forms (only post and get work by default)
const flash = require('connect-flash'); // Allow to display flash messages
const session = require('express-session'); // Necessary for connect-flash
const bodyParser = require('body-parser'); // Parsing forms
const passport = require('passport'); // Authentication
const hb_helpers = require('./helpers/handlebars_helpers');

// Load routes
const index = require('./routes/index');
const contacts = require('./routes/contacts');
const messages = require('./routes/messages');
const users = require('./routes/users');

// Passport Config
require('./config/passport')(passport);

// Initialize app
const app = express();

//Set up mongoose connection
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/dechat', {
    // Settings
})
    .then(() => console.log('MongoDB Connected...')) // Catch promise (always with then, catch)
    .catch(err => console.error.bind(console, 'MongoDB connection error:'));

/* ------------------------- *
 *        Middleware         *
 * ------------------------- */ 
var hbs = exphbs.create({
  defaultLayout: 'main',
  // Specify helpers which are only registered on this instance.
  helpers: {
      select: hb_helpers.select
  }
});

// view engine setup (handlebars middleware)
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Method override middleware
app.use(methodOverride('_method'));

// Express session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

// Passport middleware, put after session middleware!
app.use(passport.initialize());
app.use(passport.session());

// Connect flash middleware
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null; // To see if someone is logged in
  next();
});

// Static folder (public)
app.use(express.static(path.join(__dirname, 'public'))); // __dirname: current directory

/* ------------------------- *
 *          Routing          *
 * ------------------------- */ 
// Use routes
app.use('/', index);
app.use('/contacts', contacts);
app.use('/messages', messages);
app.use('/users', users);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;