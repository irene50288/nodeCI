jest.setTimeout(10000);

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true,
  useUndefinedTopology: true,
});

afterAll(async () => {
  await mongoose.disconnect();
});

module.exports = {
  testEnvironment: 'node'
};