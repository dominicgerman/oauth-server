import express from "express";
import bodyParser from "body-parser";
import { authorize } from "./auth";
import { token } from "./token";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/oauth/authorize", authorize);
app.post("/api/oauth/token", token);

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`OAuth Server running on http://localhost:${PORT}`);
});

export default app;