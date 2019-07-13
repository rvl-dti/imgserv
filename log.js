const winston = require('winston');

const file1 = new winston.transports.File({filename: './logs/combined.log'});
const file2 = new winston.transports.File({filename: './logs/error.log',
  level: 'error'});

const logger = winston.createLogger({});

winston.add(file1);
winston.add(file2);

module.exports=logger;
