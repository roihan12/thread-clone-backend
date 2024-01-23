import { web } from "./application/web.js";
import { logger } from "./application/logger.js";
import dotenv from "dotenv";
import connectDB from "./application/database.js";

dotenv.config();

connectDB();
const PORT = process.env.PORT || 5000;

web.listen(5000, () => {
  logger.info(`server listening on http://localhost:${PORT}`);
});
