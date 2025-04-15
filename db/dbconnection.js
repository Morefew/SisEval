import mongoose from "mongoose";
import 'dotenv/config'

const DBURI = process.env.MONGODB_URI;
const DBHOST = process.env.MONGODB_HOST;


console.log("Innitializing connection to MongoDB...");

mongoose.connect(DBURI)
  // .then(() => {
  //   console.log("MongoDB Connected Successfully.")
  // })
  // .catch(err => {
  //   console.error('An error has occur connecting to MongoDB: ', err.message)
  // })

mongoose.connection.on('connected', function () {
  console.log('Mongoose connected to MongoDB ' + DBHOST);
});
mongoose.connection.on('error',function (err) {
  console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose disconnected');
});
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});