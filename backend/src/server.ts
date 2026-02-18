import app from "./app.js";
import connectDB from "./lib/db.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
  connectDB()
});