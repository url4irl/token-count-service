import { createApp } from "./app";

const app = createApp();
const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`Token Count Service is running on http://localhost:${PORT}`);
});