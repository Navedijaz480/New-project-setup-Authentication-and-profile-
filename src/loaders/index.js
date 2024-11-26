const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const appRoutes = require("../api");

module.exports = function (app) {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(express.json({ limit: "20mb" }));
    app.use(express.urlencoded({ limit: "20mb", extended: true }));
    app.use(cors());

    // Routes
    app.use("/api", appRoutes);

    // Basic route
    app.get("/", (req, res) => {
        res.send("<h1>Initial route running...</h1>");
    });
};
