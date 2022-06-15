const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

app.use("/notes", require("./routes/NotesRoutes"));
app.use("/todos", require("./routes/TodosRoutes"));

exports.app = functions.https.onRequest(app);
