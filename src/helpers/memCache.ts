import { Log } from "./logger";
import dotenv from "dotenv";
dotenv.config();
export class MemCache {
  public static hset(set: string, key: string, val: any) {
    if (!this.memCache[set]) {
      this.memCache[set] = {};
    }
    this.memCache[set][key] = val;
    this.logger.debug(`*inMemory* hset: ${set} :: ${key} :: ${val}`);
  }

  public static hget(set: string, key: string) {
    let val = null;
    if (this.memCache[set] && this.memCache[set][key]) {
      val = this.memCache[set][key];
    }
    this.logger.debug(`*inMemory* hget: ${set} :: ${key} :: ${val}`);
    return val;
  }

  public static get(set: string) {
    const val = Object.keys(this.memCache[set]).map((key) => this.memCache[set][key])
    return val;
  }

  public static hdel(set: string, key: string) {
    if (this.memCache[set] && this.memCache[set][key]) {
      delete this.memCache[set][key];
    }
    this.logger.debug(`*inMemory* hdel: ${set} :: ${key}`);
  }
  private static logger = Log.getLogger();

  private static memCache = {};
}
