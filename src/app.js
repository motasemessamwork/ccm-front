const express = require("express");

const app = express();

app.use(express.json());

app.use("/", require("./routes/index.routes"));

app.use(
    "/auth",
    require(
        "./routes/auth.routes"
    )
);


app.use(
    "/sessions",
    require("./routes/session.routes")
);

app.use(
    "/sessions",
    require("./routes/message.routes")
);

module.exports = app;