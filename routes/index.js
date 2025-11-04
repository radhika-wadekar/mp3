/*
 * Connect all of your endpoints together here.
 */
const express = require('express');

module.exports = (app) => {
  app.use('/api/users', require('./users.js')(express.Router()));
  app.use('/api/tasks', require('./tasks.js')(express.Router()));
  app.use('/api', require('./home.js')(express.Router()));
};
