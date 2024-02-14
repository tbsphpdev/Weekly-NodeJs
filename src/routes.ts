import express = require("express");
import * as l10n from "jm-ez-l10n";
import {UserRoute} from "./modules/auth/userRoute";
export class Routes {
  protected basePath: string;
  public defaultRoute(req: express.Request, res: express.Response) { res.json({ message: "Hello !"}); }
  public path() {
    const router = express.Router();
    /* user route */
    router.use("/user", UserRoute);
    router.use("/activities", ProductivityRoute);
    router.use("/other", OtherRoute);
    router.use("/friend", CompeteRoute);
    // router.all("/*", (req, res) => {
    //   return res.status(404).json({ error: l10n.t("ERR_URL_NOT_FOUND")});
    // });
    return router;
  }
}
