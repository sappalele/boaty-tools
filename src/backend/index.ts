import { initDB } from "./utils/db";
import { logger } from "./utils/logger";
import { handleMessage } from "./utils/messageHandler";

(async () => {
  await initDB();
})();

const handleMesssages = () => {
  process.parentPort.on("message", (e) => {
    handleMessage(e.data);
  });
};

try {
  handleMesssages();
} catch (error) {
  logger.error(error);
  logger.log("recovering message handler");
  handleMesssages();
}
