const fs = require('fs');

// Function to log messages into a file
function LogToFile(message) {
  const timestamp = new Date().toISOString();  // Adds a timestamp to each log entry
  const logMessage = `[${timestamp}] ${message}`;

  // Append the log message to the log file (log.txt in this case)
  fs.appendFile('./logs/logs.txt', logMessage + '\n', (err) => {
    console.log(logMessage)//also outputs every entrie into a console
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

module.exports = {LogToFile};