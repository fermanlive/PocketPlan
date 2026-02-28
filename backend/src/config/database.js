const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = `mongodb+srv://fermanlive:${process.env.password_mongo}@cluster0.5kzxsxz.mongodb.net/pocketplan?appName=Cluster0`;
  await mongoose.connect(uri, {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
    serverSelectionTimeoutMS: 5000,
  });
  console.log('MongoDB Atlas conectado');
};

module.exports = connectDB;