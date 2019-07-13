const winston = require('winston');

const file1 = new winston.transports.File({filename: './logs/combined.log'});
const file2 = new winston.transports.File({filename: './logs/error.log',
  level: 'error'});

const logger = winston.createLogger({
  level: 'info',
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({filename: './logs/error.log', level: 'error'}),
    new winston.transports.File({filename: './logs/combined.log'}),
  ],
});

winston.add(file1);
winston.add(file2);

module.exports=logger;
