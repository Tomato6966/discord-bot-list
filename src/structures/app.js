const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");

const fs = require('fs');
const http = require('http');
const https = require('https');

// Certificate
const privateKey = fs.readFileSync('../../../../../etc/letsencrypt/live/faster-bots.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('../../../../../etc/letsencrypt/live/faster-bots.com/cert.pem', 'utf8');
const ca = fs.readFileSync('../../../../../etc/letsencrypt/live/faster-bots.com/chain.pem', 'utf8');

const { discord_client: {secret} } = require("@root/config.json");

require("@utils/passport.js");

const getFilesSync = require("@utils/fileWalk");

class App {
  constructor(client, locals = {}) {
    this.express = express();
    this.express.set("views", "src/dynamic");
    this.express.set("view engine", "pug");
    this.express.set("client", client);
    this.express.locals = locals;

    / * Middleware Functions */;
    this.express.use(cookieParser());
    this.express.use(express.static(__dirname + "/../public"));
    this.express.use(
      session({
        secret,
        resave: false,
        saveUninitialized: false,
      })
    );
    this.express.use(passport.initialize());
    this.express.use(passport.session());
    this.express.use((req, _, next) => {
      if (!["/theme", "/login"].includes(req.originalUrl) && !req.originalUrl.startsWith("/api"))
        req.session.url = req.originalUrl
      next()
    })
    this.loadRoutes().loadErrorHandler();
  }

  listen(port) {


    const credentials = {
      key: privateKey,
      cert: certificate,
      ca: ca
    };

    this.express.use((req, res) => {
      res.send('Hello there !');
    });

    // Starting both http & https servers
    const httpServer = http.createServer(this.express);
    const httpsServer = https.createServer(credentials, this.express);

    httpServer.listen(80, () => {
      console.log('HTTP Server running on port 80');
    });

    httpsServer.listen(443, () => {
      console.log('HTTPS Server running on port 443');
    });
    //return new Promise((resolve) => this.express.listen(port, resolve));
  }

  loadRoutes() {
    const routesPath = path.join(__dirname, "../routes");
    const routes = getFilesSync(routesPath);

    if (!routes.length) return this;

    routes.forEach((filename) => {
      const route = require(path.join(routesPath, filename));

      const routePath =
        filename === "index.js" ? "/" : `/${filename.slice(0, -3)}`;

      try {
        this.express.use(routePath, route);
      } catch (error) {
        console.error(`Error occured with the route "${filename}"\n\n${error}`);
      }
    });

    return this;
  }

  loadErrorHandler() {
    this.express.use((req, res) => {
      res.status(404);
      if (req.accepts("html")) return res.render("404", {req});

      if (req.accepts("json"))
        return res.send({
          status: 404,
          error: "Not found",
        });

      res.type("txt").send("404 - Not found");
    });

    return this;
  }
}

module.exports = App;
