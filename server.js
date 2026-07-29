const { existsSync } = require("fs");
const { join } = require("path");

const standaloneServer = join(__dirname, ".next", "standalone", "server.js");

if (existsSync(standaloneServer)) {
  process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";
  require(standaloneServer);
} else {
  const { createServer } = require("http");
  const { parse } = require("url");
  const next = require("next");

  const dev = process.env.NODE_ENV !== "production";
  const app = next({ dev, dir: __dirname });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    const port = parseInt(process.env.PORT || "3000", 10);
    createServer((req, res) => {
      handle(req, res, parse(req.url, true));
    }).listen(port, () => {
      console.log(`> Invite ready on port ${port} (pre-standalone build)`);
    });
  });
}
