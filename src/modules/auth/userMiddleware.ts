import { Constants } from "../../config/constants";
import { ResponseBuilder } from "../../helpers/responseBuilder";
import * as sql from "jm-ez-mysql";
import { Tables, UserTable, UserNotification, UserHabits, Package, Subscription, FriendList, Compete  } from "../../config/table";
import moment from "moment";

export class UserMiddleware {

  public getUserDetails = async (req, res, next) => {
    const result = await sql.first(`${Tables.USER} left join (SELECT ${UserHabits.USERID}, GROUP_CONCAT(${UserHabits.NAME}) as habits FROM ${Tables.Habit} WHERE ${UserHabits.HABIT} = 0 GROUP by ${UserHabits.USERID}) as t on t.${UserHabits.USERID} = ${Tables.USER}.${UserTable.ID}`, ['*'], `${UserTable.ID}='${req._user._id}'`);
    req.user = result;
    next();
  }

  public getUserOwnCompete = async(req, res, next) => {
    const result = await sql.first(`${Tables.COMPETE} `, [`count(${Compete.ID}) as total`], `(${Compete.USERID} = ${req._user._id} or ${Compete.OTHERUSERID} = ${req._user._id}) and ${Compete.STATUS} IN (1,2)`);
    req.competeCount = result.total;
    next();
  }


  public checkUser  = async(req, res, next) => {  
      //req.body.authSub = '103825817066959330773';      
      const {authSub, timestamp, email} = req.body;
      const result = await sql.first(`${Tables.USER}`, ['*'], `${UserTable.AUTHSUB}= '${authSub}'`);
      if(result && result._id){ 
          req.user = result;
      }
      next();
  }

  public checkOldHabits  = async(req, res, next) => {        
    const { oldName, keepData, name } = req.body;
    const result = await sql.first(`${Tables.Habit}`, ['*'], `${UserHabits.NAME}='${oldName}' and ${UserHabits.USERID}='${req._user._id}'`);
    if(result){
        req.habit = result;
        next();
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("ERR_NO_HABIT_FOUND")));
    }    
  }

  public checkHabits  = async(req, res, next) => {        
    const { name } = req.body;
    const result = await sql.first(`${Tables.Habit}`, ['*'], `${UserHabits.NAME}='${name}' and ${UserHabits.USERID}='${req._user._id}'`);
    if(result){
        req.habit = result;
        next();
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("ERR_NO_HABIT_FOUND")));
    }
  }  

  public ishabitExist  = async(req, res, next) => {        
    const { name } = req.body;
    const result = await sql.first(`${Tables.Habit}`, ['*'], `${UserHabits.NAME}='${name}' and ${UserHabits.USERID}='${req._user._id}'`);
    if(result){
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("ERR_HABIT_EXIST")));
    }else{
      next();
    }
  } 

  public isApplicationExist  = async(req, res, next) => {        
    const applications = (req.body.applications.replace("https://",'').replace("www.",'')).split('/')[0];
    const habitId = req.habit ? req.habit._id: req.app.habitId;
    const result = await sql.first(`${Tables.Habit}`, [`*`], `${Tables.Habit}.${UserHabits.NAME}='${applications}' and ${Tables.Habit}.${UserHabits.HABIT} = ${habitId} and ${Tables.Habit}.${UserHabits.USERID} ='${req._user._id}'`);
    if(result){
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("ERR_APPLICATION_EXIST")));
    }else{
      next();
    }
  } 

  public getApplicationById  = async(req, res, next) => {        
    const { applicationId } = req.body;
    const result = await sql.first(`${Tables.Habit}`, ['*'], `${UserHabits.ID}='${applicationId}'`);
    if(result){
      req.app = result;
      next(); 
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("APPLICATION_NOT_EXIST")));
    }
  } 

  public getAllHabits  = async(req, res, next) => {
    const result = await sql.findAll(`${Tables.Habit}`,[`${UserHabits.ID},${UserHabits.NAME},${UserHabits.HABIT}`], 
      `${UserHabits.USERID} = ${req._user._id} order by ${UserHabits.ID} desc`);
      if(result){
      req.habits = result;
      next();
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("ERR_NO_HABIT_FOUND")));
    }
  } 

  public getNotificationCount  = async(req, res, next) => {
    const result = await sql.first(`${Tables.NOTIFICATION}`, ['count(_id) as Count'], `${UserNotification.USERID}='${req._user._id}' and ${UserNotification.ISREAD} = 0`);
      req.count = result.Count;
      next();
    }

  public getDefaultSubscritpion  = async(req, res, next) => {
    if(!req.user){
    const result = await sql.first(`${Tables.PACKAGE}`, ['*'], `${Package.PRICE}=0.00 order by days asc`);
      req.subscription = result;
    }
    next();
  }

  public getApplicationByHabit = async(req, res, next) => {
    const result = await sql.findAll(`${Tables.Habit}`,[`${UserHabits.ID},${UserHabits.NAME},${UserHabits.HABIT}`], 
    `${UserHabits.HABIT} = ${req.params.habitId} or ${UserHabits.ID} = ${req.params.habitId} order by ${UserHabits.ID} desc`);
    req.habits = result;
    next();
  }

  public getUserSubscription  = async(req, res, next) => {
    const date = moment().format(Constants.DATE_FORMAT);
    const result = await sql.first(`${Tables.SUBSCRIPTION}`, ['*'], `${Subscription.USERID}=${req._user._id} and ${Subscription.STARTDATE} <= '${date}' and ${Subscription.ENDDATE} >= '${date}' and ${Subscription.STATUS} = 1`);
      req.subscription = result;
      next();
  }

  public getHabitApplicationCount = async(req, res, next) => {
    const result = await sql.findAll(`${Tables.Habit}`, ['*'], `${UserHabits.USERID}=${req._user._id} and ${UserHabits.HABIT} = ${req.habit._id}`);
    if(!req.subscription && result.length >= Constants.SUBSCRIPTION.APPLICATION_LIMIT){
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("ERR_APPLICATION_SUBSCRIPTION")));
    }else {
      next();
    }
  }

  public getMyFriendsCount = async(req, res, next) => {
    const result = await sql.first(`${Tables.FRIENDSHIP}`,[`count(CASE when ${FriendList.USERA} = ${req._user._id} then 1 END) as following, count(CASE when ${FriendList.USERB} = ${req._user._id} then 1 END) as followers`], `(${FriendList.USERA} = ${req._user._id} or ${FriendList.USERB} = ${req._user._id}) and ${FriendList.ISFRIEND} = 1`);
    req.friendlist = result;
    next();
  }
  
  public getApplicationAllHabits = async(req, res, next) => {
    const result = await sql.first(`${Tables.Habit}`,[`GROUP_CONCAT(${UserHabits.HABIT}) as habits`],`${UserHabits.USERID} = ${req._user._id} and ${UserHabits.NAME} = '${req.params.application}' and ${UserHabits.HABIT} != 0`);
    req.habit = result;
    next();
  }
  
}