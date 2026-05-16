import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`Kasir Lite POS API running on http://localhost:${env.PORT}`);
});
