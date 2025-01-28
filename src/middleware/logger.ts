import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf } = format;
import fs from "fs";
import path from "path";

// directory if it doesn't exist
const logsDirectory = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory);
}

//  custom format
const customFormat = printf(
  ({ level, message, timestamp, file, function: func }) => {
    const formattedDate = new Date().toLocaleDateString();
    const formattedTime = new Date().toLocaleTimeString([], {
      hour12: false,
    });
    return `Level:${level} Message:${message} FileName:${file} FunctionName:${func} Date : ${formattedDate} Time : ${formattedTime} `;
  }
);
//  logger instance
export const logger = createLogger({
  format: combine(timestamp(), customFormat),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: new Date().toISOString().split("T")[0] + ".log",
      dirname: logsDirectory,
      maxFiles: 30,
      maxsize: 10 * 1024 * 1024,
      format: combine(timestamp(), customFormat),
    }),
  ],
});

// Add metadata
export function logWithSourceInfo(
  message: string,
  file?: string,
  func?: string,
  level = "info"
) {
  logger.log({
    level,
    message,
    file,
    function: func,
  });
}
