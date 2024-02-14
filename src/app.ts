import bodyParser from "body-parser"; 
import dotenv from "dotenv";
import express from "express";
import l10n from "jm-ez-l10n";
import { Log } from "./helpers/logger";
import fileUpload from "express-fileupload";
import { Routes } from "./routes";
import jmEzMySql from "jm-ez-mysql";
import cron from "node-cron";
import { CronController } from "./helpers/cron";
import http from "http";
import moment from "moment-timezone";
dotenv.config();

jmEzMySql.init({
  acquireTimeout: 100 * 60 * 1000,
  connectTimeout: 100 * 60 * 1000,
  connectionLimit: 10,
  database: process.env.DATABASE,
  dateStrings: true,
  host: process.env.DBHOST,
  multipleStatements: true,
  password: process.env.DBPASSWORD,
  timeout: 100 * 60 * 1000,
  timezone: "utc",
  charset : "utf8mb4",
  user: process.env.DBUSER,
});

export class App {
  protected app: express.Application;
  private logger = Log.getLogger();
  constructor() {
    const PORT = process.env.PORT as string;
    this.app = express();
    this.app.all("/*", (req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
      res.header('Access-Control-Expose-Headers', 'Content-Length');
      res.header('Access-Control-Allow-Headers', 'Accept, Authorization, zone, Content-Type, timezone, X-Requested-With, Range');
      if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
      } else {
        next();
      }
    });
    moment.tz.setDefault("UTC");
    l10n.setTranslationsFile("en", "src/language/translation.en.json");
    this.app.use(l10n.enableL10NExpress);
    this.app.use(bodyParser.json({ limit: "50mb" }));
    this.app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
    this.app.use(bodyParser.json(), (error, req, res, next) => {
      if (error) {
        return res.status(400).json({ error: req.t("ERR_GENRIC_SYNTAX") });
      }
      next();
    });

    this.app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json
    this.app.use(fileUpload({  // used for file upload and to accept form-data in request
      useTempFiles : true,
      tempFileDir : '/tmp/'
    }));
    const routes = new Routes();
    this.app.use("/api", routes.path());
    const  server = new http.Server(this.app);
    // cron.schedule("* * * * * *", function() {
    //   //CronController.compitionResult();
    //   //CronController.dataActivity();
    // })
    server.listen(PORT, () => { 
      this.logger.info(`The server is running in port localhost: ${process.env.PORT}`);
    });
    }
}
