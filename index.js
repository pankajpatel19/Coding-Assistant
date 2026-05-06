import app from "./src/app.js";
import { PORT } from "./src/utils/env.js";
import { checkEnv } from "./src/utils/env.js";

checkEnv();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
