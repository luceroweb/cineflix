//IMPORT PACKAGE
const express = require("express");
const morgan = require("morgan");
const moviesRouter = require("./Routes/moviesRoutes");
const authRouter = require("./Routes/authRouter");
const CustomError = require("./Utils/CustomError");
const globalErrorHandler = require("./Controllers/errorController");

let app = express();

app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.static("./public"));
app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString();
  next();
});

//USING ROUTES
app.use("/api/v1/movies", moviesRouter);
app.use("/api/v1/users", authRouter);
app.all("*", (req, res, next) => {
  const err = new CustomError(
    `Can't find ${req.originalUrl} on the server.`,
    404
  );
  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
