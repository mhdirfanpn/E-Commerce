var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");



var userRouter = require("./routes/user");
var adminRouter = require("./routes/admin");
const db = require("./Model/connection");
var session = require("express-session");
var ConnectMongoDBSession = require("connect-mongodb-session");
var mongoDbSesson = new ConnectMongoDBSession(session);
const expressLayout = require("express-ejs-layouts");
var app = express();
var fileUpload = require("express-fileupload");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayout);
app.use(fileUpload());

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "key",
    cookie: { maxAge: 6000000 },
    resave: true,
    store: new mongoDbSesson({
      uri: "mongodb://localhost:27017/Evara",
      collection: "session",
    }),
    saveUninitialized: true,
  })
);

app.use(function (req, res, next) {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

app.use("/", userRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
