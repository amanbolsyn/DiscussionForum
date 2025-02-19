const winston = require('winston');

// Function to generate the log file name based on the current date
const generateLogFilename = () => {
  const date = new Date();
  const formattedDate = date.toISOString().split('T')[0]; // "YYYY-MM-DD" format
  return `${formattedDate}-log.json`; // logs/2025-02-20-log.json
};


const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
       // winston.format.cli(), // Add color to log levels
       winston.format.colorize(),
       winston.format.simple()  
      )
    }),
    new winston.transports.File({ filename: './logs/' + generateLogFilename() })
  ],
});

module.exports = logger; 