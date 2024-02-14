import * as _ from "lodash";
import { Encrypt } from "./helpers/encrypt";
import { Jwt } from "./helpers/jwt";
import { ResponseBuilder } from "./helpers/responseBuilder";
import * as sql from "jm-ez-mysql";
import { Tables, UserTable, UserNotification  } from "./config/table";

export class Middleware {

  private encryptUtil: Encrypt = new Encrypt();
  public authenticateUser = async (req, res, next: () => void) => {
    if (req.headers.authorization && !_.isEmpty(req.headers.authorization)) {
      req.headers.authorization = req.headers.authorization.split(" ");
      const tokenInfo:any = Jwt.decodeAuthToken(req.headers.authorization[1]);
      if (req.headers.authorization[0] === 'Bearer' && tokenInfo.userId && tokenInfo.authSub) { 
        const result = await sql.first(`${Tables.USER}`, ['*'], `${UserTable.ID}='${tokenInfo.userId}'`);
        if (result) {
          req._user = result;
          next();
        } else {
          return res.status(401).json(ResponseBuilder.errorMessage(req.t("ERR_UNAUTH")));
        }
      } else {
        return res.status(401).json(ResponseBuilder.errorMessage(req.t("ERR_UNAUTH")));
      }

    } else {
      return res.status(401).json(ResponseBuilder.errorMessage(req.t("ERR_UNAUTH")));
    }
  }

  public generateNewToken = async (req, res, next: () => void) => {
    if (req.headers.authorization && !_.isEmpty(req.headers.authorization)) {
      req.headers.authorization = req.headers.authorization.split(" ");
      const tokenInfo:any = Jwt.getDatafromToken(req.headers.authorization[1]);
      if (req.headers.authorization[0] === 'Bearer' && tokenInfo.payload['userId'] && tokenInfo.payload['authSub']) {
        const result = await sql.first(`${Tables.USER}`, ['*'], `${UserTable.ID}='${tokenInfo.payload['userId']}'`);
        if (result) {
          const token = Jwt.getAuthToken({ userId: result._id, authSub : result.authSub });
          res.status(200).json(ResponseBuilder.data({token : token}, req.t("SUCCESS")));
        } else {
          return res.status(401).json(ResponseBuilder.errorMessage(req.t("ERR_UNAUTH")));
        }
      } else {
        return res.status(401).json(ResponseBuilder.errorMessage(req.t("ERR_UNAUTH")));
      }
    } else {
      return res.status(401).json(ResponseBuilder.errorMessage(req.t("ERR_UNAUTH")));
    }
  }
}
