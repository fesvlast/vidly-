const express = require('express');
const winston = require('winston');

const app = express();

require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);


const port = process.env.port || 3000;
winston.info(`Started on port ${port} ...`);
const server = app.listen(port);

module.exports = server;


