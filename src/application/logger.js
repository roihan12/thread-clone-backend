import winston from "winston";
import { MongoDB } from "winston-mongodb";
const { transports, format, createLogger } = winston;
const { combine, printf } = format;
import dotenv from "dotenv";
dotenv.config();

// Create a timeStamp
const logTime = new Date().toLocaleDateString();
// Crate a custom log
const customLog = printf(({ level, message }) => {
  return `Level:[${level}] LogTime: [${logTime}] Message:-[${message}]`;
});
const date = new Date();
const newdate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
const options = {
  info: {
    level: "info",
    dirname: "logs/combined",
    json: true,
    handleExceptions: true,
    maxSize: "20",
    filename: `combined-${newdate}.log`,
    datePattern: "YYYY-MM-DD-HH",
  },
  dbinfo: {
    level: "info",
    collection: "deliveryLog",
    db: process.env.MONGO_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    maxsize: 52428800, // 50MB
  },
  error: {
    level: "error",
    dirname: "logs/error",
    json: true,
    handleExceptions: true,
    filename: `error-${newdate}.log`,
  },
  console: {
    level: "debug",
    json: true,
    handleExceptions: true,
    colorize: true,
  },
  // New transporter for request logs
  request: {
    level: "info",
    dirname: "logs/request",
    json: true,
    handleExceptions: true,
    filename: `request-${newdate}.log`,
  },
};

export const logger = new createLogger({
  format: combine(customLog),
  transports: [
    new transports.File(options.info),
    new transports.File(options.error),
    new MongoDB(options.dbinfo),
    new transports.Console(options.console),
    // Add the new request transporter
    new transports.File(options.request),
  ],
  exitOnError: false,
});

// Contoh penggunaan logger:
// logger.info("Ini adalah pesan info");
// logger.error("Ini adalah pesan error");
// logger.debug("Ini adalah pesan debug");
// logger.log("request", "Ini adalah pesan request");
