const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");

let server = { close: () => console.log("Server was not initiated.") };

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncaught exception occured! Shutting down...");
  server.close(() => {
    process.exit(1);
  });
  process.exit(1);
});

const app = require("./app");

mongoose
  .connect(process.env.CONN_STR, {
    useNewUrlParser: true,
  })
  .then((conn) => {
    console.log("DB Connection Successfull");
  });

//CREATE A SERVER
const port = process.env.PORT || 3000;

server = app.listen(port, () => {
  console.log("Server has started...");
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled rejection occured! Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
