import express from "express";
import router from "./routes/api";
import bodyParser from "body-parser";
import db from "./utils/database";

const init = async () => {
  try {
    const result = await db();
    console.log(`database status: ${result}`);

    const app = express();
    const PORT = 3000;

    app.use(bodyParser.json());
    app.use("/api", router);

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

init();
