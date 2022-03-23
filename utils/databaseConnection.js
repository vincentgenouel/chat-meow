// async function main() {
//   await mongoose.connect("mongodb://localhost:27017/test");
// }

const mongoose = require("mongoose");

// mongoose
//   .connect(process.env.DB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Successful connection to MongoDB!"))
//   .catch(() => console.log("Failed to connect to MongoDB!"));

function db_connect() {
  return mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

module.exports = { db_connect };
