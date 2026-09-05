import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

app.listen(env.PORT, () => {
  logger.info(`Beaverr API running on port ${env.PORT}`);
});
