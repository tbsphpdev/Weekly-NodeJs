import moment = require('moment');
import { createLogger, format, transports } from "winston";

const {
  combine, timestamp, prettyPrint, colorize,
} = format;

export class Log {

  public static getLogger() {
    return createLogger({
      format: combine(
        timestamp({ format: this.timestampFormat }),
        prettyPrint(),
        colorize(),
      ),
      level: "debug",
      transports: [new transports.Console()],
    });
  }
  private static timestampFormat: any = moment().format('yyyy-MM-DD:hh:mm:ss');
}
