const express = require("express");
const app = express();
const config = require("./src/config");
const colors = require("./src/loaders/color");
require("dotenv").config();

// Initialize database
require("./src/loaders/db")();
// Load express middlewares and routes
require("./src/loaders/index")(app);

async function startServer() {
  app
    .listen(config.port, () => {

      console.log(
        colors.fg.cyan,
        `
      ########################################
      🛡️  Server is listening on port: ${config.port}  🛡️
      ########################################
      `,
        colors.reset
      );
    })
    .on("error", (err) => {
      console.log("Server starting error: ", err);
      process.exit(1);
    });
}

startServer();

