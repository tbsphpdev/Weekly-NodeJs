import moment = require('moment');
import * as dotenv from "dotenv";
dotenv.config();

export class Constants {
  public static readonly TIMEZONE = 'America/New_York';
  public static readonly SUCCESS = 'SUCCESS';
  public static readonly ERROR = 'ERROR';
  public static readonly BAD_DATA = 'BAD_DATA';
  public static readonly BACKEND_API_FAILURE = 'BACKEND_API_FAILURE';
  public static readonly ERR_TOKEN_EXP = "Token Expiry";
  public static readonly CODE = 'CODE';
  public static readonly APPROVED = 'APPROVED';
  public static readonly INVALID_REQUEST = 'INVALID_REQUEST';
  public static readonly DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ssZZ';
  public static readonly DATE_WITH_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
  public static readonly DOB_FORMAT = 'MM/DD/YYYY';
  public static readonly MATCH_DATE_TIME_FORMAT = 'MM-DD-YYYY, h:mmA z';
  public static readonly DATE_FORMAT = 'YYYY-MM-DD';
  public static readonly SHOW_DATE_FORMAT = 'LL';
  public static readonly MONTH_YEAR_FORMAT = 'YYYY-MM';
  public static readonly UNIX_FORMAT = 'x';
  public static readonly YEAR_FORMAT = 'YYYY';
  public static readonly MONTH_FORMAT = 'MMMM';
  public static readonly ERROR_CODE = 400;
  public static readonly UNAUTHORIZED = 401;
  public static readonly CURRENT_DATE = moment().format('YYYY-MM-DD:hh:mm:ss');
  public static readonly TODAY_DATE = moment().format('YYYY-MM-DD');
  public static readonly HASH_STRING_LIMIT = 12;
  public static readonly ADMIN_HASH_STRING_LIMIT = 15;
  public static readonly SUCCESS_CODE = 200;
  public static readonly GOOGLE_OAUTH_URL = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=";
  public static readonly GOOGLE = 'GOOGLE';
  public static readonly DEFAULT_TIMEZONE = "America/New_York";
  public static readonly SUBJECT = "Support Mail";
  public static readonly EMAIL_message = "<p>Hi Support Team,</p><p> <b>[user] </b> has some issues in : [topic]. Please find below:</p><p><b>Email</b> : [email]</p><p><b>message</b> : [message]</p>";

  public static readonly CONFIG = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    region: process.env.AWS_REGION,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }

  public static readonly STRIPE_API_VERSION = "2022-11-15";

  public static readonly ROUTES = {
      SIGNIN : '/login',
      FIND_USER : '/find-user',
      CREATE_HABIT : '/create-habit',
      RENAME_HABIT : '/rename-habit',
      DELETE_HABIT : '/delete-habit'
  };

  public static readonly SOCIAL_TYPE = {
    GOOGLE: 'google'
  };
