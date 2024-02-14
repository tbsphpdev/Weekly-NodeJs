import { Request, Response } from "express";
import { Constants } from "../../config/constants";
import { Log } from "../../helpers/logger";
import { ResponseBuilder } from "../../helpers/responseBuilder";
import { Jwt } from "../../helpers/jwt";
import dotenv from "dotenv";
import moment from "moment-timezone";
import * as sql from "jm-ez-mysql";
import { Tables, UserHabits, UserTable  } from "../../config/table";
import { Aws } from "../../helpers/aws";
import { NotificationAndPush } from "../../helpers/notification";
import { SendEmail } from "../../helpers/sendEmail-sendgrid";
import Stripe from 'stripe';

dotenv.config();

export class UserController {
  private logger: any = Log.getLogger();
  private notification = new NotificationAndPush();
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: Constants.STRIPE_API_VERSION
  });
  

  public socialLogin = async (req: any, res: Response , next) => { 
    const { authSub, email, name, image, timestamp, type } = req.body;
    if(req.user){
      if(type === "signup"){
        return res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.errorMessage(req.t("ACCOUNT_EXIST")));
      } else {
        req.user.settings = JSON.parse(req.user.settings);
        req.user['token'] = Jwt.getAuthToken({ userId: req.user._id, authSub : authSub });
        req.user['isNew'] = false;
        res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.data(req.user,req.t("LOGIN_SUCCESS")));
      }
    }else if(req.body.email == ''){
      return res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t('FAILED')));
    }else if(type === "signin"){
      return res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.errorMessage(req.t("ACCOUNT_NOT_EXIST")));
    }else{
      const code = name.charAt(0).toUpperCase();
      const username = await sql.first(`${Tables.USER}`, ['*'], `${UserTable.USERNAME} like '%${Constants.USERNAME[code]}%' order by ${UserTable.ID} desc`);
      const last = username ? username.username.replace(Constants.USERNAME[code],'') : 0;
      const user = {
        authSub: authSub,
        email: email,
        firstName: name.split(" ")[0].trim(),
        lastName: name.split(" ")[1].trim(),
        image: image,
        bio: "",
        username : Constants.USERNAME[code]+''+(parseInt(last)+1), 
        settings: JSON.stringify({
          allowfriends: true, 
          newfriends : false, 
          acceptingnewreqs : false,
          messagesoff : false,
          messagereqs : false,
          reminders : false,
          newsemails : false,
          reminderemails : false,
          feedbackemails : false,
          supportemails : false,
          privateaccount : false, 
          competitions : false, 
          onlypeopleyoufollow : false,
          pausetimetracking : false, 
          troubleshooting : true, 
          showdatanoone : false,
          startworking : "09:00 AM",
          stopworking : "05:00 PM"
        }),
        productivity : 480,
        habit : 120,
        timezone : Constants.DEFAULT_TIMEZONE,
        isdeactive : 0,
        createdAt : moment().format(Constants.DATE_WITH_TIME_FORMAT),
        updatedAt : moment().format(Constants.DATE_WITH_TIME_FORMAT)
      };
      const result = await sql.insert(`${Tables.USER}`, user);
      if(result){
        await this.notification.saveNotification(Constants.NOTIFICATION.FIRST_LOGIN.title.replace('[name]',name),Constants.NOTIFICATION.FIRST_LOGIN.message,'new_signup', result.insertId);
        SendEmail.SendThirdPartyEmail([email], Constants.SUBJECT, Constants.TEMPLATE.NEW_USER ,{ first_name : name.split(" ")[0].trim()});
        const users = await sql.first(`${Tables.USER}`, ['*'], `${UserTable.ID}=${result.insertId}`);
        users.settings = JSON.parse(users.settings);
        users['isNew'] = true;
        users['token'] = Jwt.getAuthToken({ userId: users._id, authSub : authSub });
        res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.data(users,req.t("LOGIN_SUCCESS")));
      }else{
        res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
      }
    }   
  } 

  // get profile
  public getProfile = async(req: any, res: Response) => {
    req.user['notification_count'] = req.count;
    req.user['friends_count'] = req.friendlist;
    req.user['competecount'] = req.competeCount ? req.competeCount : 0;
    req.user.settings = JSON.parse(req._user.settings);
    req.user.subscriptionId = req.subscription ? 1 : 0;
    res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.data(req.user, req.t("SUCCESS"))); 
  }

  // create habit
  public createHabit = async(req: any, res: Response) => {
    const { name } = req.body;
      const data = {
        name: name,
        habitId : 0,
        userId: req._user._id,
        createdAt : moment().format(Constants.DATE_WITH_TIME_FORMAT),
        updatedAt : moment().format(Constants.DATE_WITH_TIME_FORMAT)
      };
    const result = await sql.insert(`${Tables.Habit}`, data);
    if(result){
      //await this.notification.saveNotification(Constants.NOTIFICATION.NEW_HABIT.title,Constants.NOTIFICATION.NEW_HABIT.message.replace('[habit]',name),'add_habit', req._user._id);
      res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
    }
  }

  // update habit
  public updateHabit = async(req: any, res: Response) => {
    const {  name, keepData } = req.body;
    const data = {
      name: name,
      updatedAt : moment().format(Constants.DATE_WITH_TIME_FORMAT) 
    };
    const result = await sql.update(`${Tables.Habit}`, data, "_id = ?", [req.habit._id]);
    if(result){
      if(keepData == false){
        await sql.delete(`${Tables.Habit}`, `${UserHabits.HABIT} = ?`, [req.habit._id]);
      }
      res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
    }
  }

  //update application
  public updateApplication = async(req: any, res: Response) => {
    const { applicationId, applications } = req.body;
    const data = {
      name: (applications.replace("https://",'').replace("www.",'')).split('/')[0],
      updatedAt : moment().format(Constants.DATE_WITH_TIME_FORMAT) 
    };
    const result = await sql.update(`${Tables.Habit}`, data, "_id = ?", [applicationId]);
    if(result){
      res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
    }
  }

  // create habit
  public deleteHabit = async(req: any, res: Response) => {
    const result = await sql.delete(`${Tables.Habit}`, `${UserHabits.ID} = ? or ${UserHabits.HABIT} = ?`, [req.habit._id, req.habit._id]);
    if(result){
      res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
    }
  }

  //delete application
  public deleteApplication = async(req: any, res: Response) => {
    const result = await sql.delete(`${Tables.Habit}`, `${UserHabits.ID} = ?`, [req.body.applicationId]);
    if(result){
      res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
    }
  }

  //add applications
  public addApplication = async(req: any, res: Response) => {
    const applications = (req.body.applications.replace("https://",'').replace("www.",'')).split('/')[0];
    const data = {
      name: applications,
      habitId : req.habit._id,
      userId: req._user._id,
      createdAt : moment().format(Constants.DATE_WITH_TIME_FORMAT),
      updatedAt : moment().format(Constants.DATE_WITH_TIME_FORMAT)
    };
    const result = await sql.insert(`${Tables.Habit}`, data);
    if(result){
      res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
    }
  } 

  public userHabits = async(req: any, res: Response) => {
    const habits = [];
    await Promise.all(req.habits.map(async (element) => {
       if(element.habitId == 0){
        const key = habits.findIndex(x => x._id == element._id);
        if(key > -1){
          habits[key].name = element.name;
        }else{
          element['applications'] = [];
          habits.push({
            _id : element._id,
            name : element.name,
            applications : []
          });
        }
      }else{
        const key = habits.findIndex(x => x._id == element.habitId);
        if(key > -1){
          habits[key].applications.push(element)
        }else{
          habits.push({
            _id : element.habitId,
            name : '',
            applications : [element]
          })
        }
        
      }
    }));
    res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.data(habits, req.t("SUCCESS"))); 
  } 

  public updateNotificationSettings = async(req: any, res: Response) => {
    const { allowfriends, newfriends, acceptingnewreqs, messagesoff, messagereqs, reminders, newsemails, reminderemails, feedbackemails, supportemails  } = req.body;
    const data = JSON.parse(req._user.settings);
    data.allowfriends = allowfriends;
    data.newfriends = newfriends; 
    data.acceptingnewreqs = acceptingnewreqs;
    data.messagesoff = messagesoff;
    data.messagereqs = messagereqs;
    data.reminders = reminders;
    data.newsemails = newsemails;
    data.reminderemails = reminderemails;
    data.feedbackemails = feedbackemails;
    data.supportemails = supportemails;
    const params = {
      settings : JSON.stringify(data),
      updatedAt : moment().format(Constants.DATE_WITH_TIME_FORMAT)
    };
    const result = await sql.update(`${Tables.USER}`, params, "_id = ?", [req._user._id]);
    if(result){
      res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
    }
  }  

  public updatePrivacySettings = async(req: any, res: Response) => {
    const { privateaccount, competitions, onlypeopleyoufollow } = req.body;
    const data = JSON.parse(req._user.settings);
    data.privateaccount = privateaccount;
    data.competitions = competitions;
    data.onlypeopleyoufollow = onlypeopleyoufollow;
    const params = {
      settings : JSON.stringify(data),
      updatedAt : moment().format(Constants.DATE_WITH_TIME_FORMAT)
    };
    const result = await sql.update(`${Tables.USER}`, params, "_id = ?", [req._user._id]);
    if(result){
      res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
    }
  }

  public updateSettingsData = async(req: any, res: Response) => {
    const { pausetimetracking, troubleshooting, showdatanoone, startworking, stopworking } = req.body;
    const data = JSON.parse(req._user.settings);
    data.pausetimetracking = pausetimetracking; 
    data.troubleshooting = troubleshooting; 
    data.showdatanoone = showdatanoone;
    data.startworking = startworking;
    data.stopworking = stopworking;
    const params = {
      settings : JSON.stringify(data),
      updatedAt : moment().format(Constants.DATE_WITH_TIME_FORMAT)
    };
    const result = await sql.update(`${Tables.USER}`, params, "_id = ?", [req._user._id]);
    if(result){
      res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
    }
  }

  public deactivateAccount = async(req: any, res: Response) => {
    if(req.subscription && req.subscription._id){
      const paymentDetails = JSON.parse(req.subscription.paymentDetails);
      const subscription = await this.stripe.subscriptions.retrieve(paymentDetails.id);
      if(subscription && subscription.status === 'active'){
        const deleted = await this.stripe.subscriptions.cancel(paymentDetails.id);
        if(deleted){
          sql.update(`${Tables.USER}`, {isdeactive : 1, updatedAt : moment().format(Constants.DATE_WITH_TIME_FORMAT)},"_id = ?", [req._user._id]);
          res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
        }else{
          res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
        }
      } else {
        sql.update(`${Tables.USER}`, {isdeactive : 1, updatedAt : moment().format(Constants.DATE_WITH_TIME_FORMAT)},"_id = ?", [req._user._id]);
        res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
      }
    }else {
      const result = await sql.delete(`${Tables.USER}`, "_id = ?", [req._user._id]); 
      if(result){
        res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
      }else{
        res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
      }
    }
  } 

  public reportIssues = async(req: any, res: Response) => {
    const { title, message } = req.body;
    const params = {
      title : title,
      userId : req._user._id,
      message : message,
      createdAt : moment().format(Constants.DATE_WITH_TIME_FORMAT),
      updatedAt : moment().format(Constants.DATE_WITH_TIME_FORMAT)
    };
    const result = await sql.insert(`${Tables.SUPPORTS}`, params);
    if(result){
      //await SendEmail.sendRawMail([process.env.SUPPORT_EMAIL], Constants.SUBJECT, Constants.EMAIL_message.replace('[user]', req._user.firstName+' '+req._user.lastName).replace('[topic]', title).replace('[email]', req._user.email).replace('[message]', message));
      SendEmail.SendThirdPartyEmail([process.env.SUPPORT_EMAIL], Constants.SUBJECT, Constants.TEMPLATE.REPORT_ISSUE, { first_name  : req._user.firstName, title : title, email : req._user.email, message : message});
      SendEmail.SendThirdPartyEmail([req._user.email], Constants.SUBJECT, Constants.TEMPLATE.REPORT_RESPONSE, { first_name  : req._user.firstName, title : title, message : message});
      res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
    }
  } 

  public uploadProfileImage = async(req: any, res: Response) =>{
    const result = await Aws.uploadImage(req.files.file, 'users');
    if(result && result.key){
      const key = {
        image : result.url,
        updatedAt : moment().format(Constants.DATE_WITH_TIME_FORMAT)
      };
      const results = await sql.update(`${Tables.USER}`, key, "_id = ?", [req._user._id]);
      if(results){
        res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
      }else{
        res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
      }
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
    }
  }

  public checkNotification = async(req: any, res: Response) =>{
    //const sendMail = await SendEmail.SendThirdPartyEmail([Constants.SUPPORT_MAIL],Constants.SUBJECT, 'SXUVsL', {amount : 2000, month : "Octomber"});
    res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
  } 

  public addGoalData = async(req: any, res: Response) =>{
    const {habit, productivity} = req.body;
    const key = {
      habit : habit,
      productivity : productivity,
      updatedAt : moment().format(Constants.DATE_WITH_TIME_FORMAT)
    };
    const results = await sql.update(`${Tables.USER}`, key, "_id = ?", [req._user._id]);
    if(results){
      res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
    }
  }

  public userApplications = async(req: any, res: Response) => {
    let habit = {};
    const application = [];
    req.habits.forEach(element => {
      if(element.habitId == 0){
        habit = element;
      }else {
        application.push(element);
      }
    })
    habit['applications'] = application;
    res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.data(habit, req.t("SUCCESS"))); 
  }

  public applicationHabits = async(req: any, res: Response) => {
    const habit = req.habit && req.habit.habits ? req.habit.habits.split(",") : [];
    res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.data(habit,req.t("SUCCESS")));
  } 

  public recoverUserAccount = async(req: any, res: Response) =>{
    const key = {
      isdeactive : 0,
      updatedAt : moment().format(Constants.DATE_WITH_TIME_FORMAT)
    };
    const results = await sql.update(`${Tables.USER}`, key, "_id = ?", [req._user._id]);
    if(results){
      res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
    }
  } 

  public updateProfile = async(req: any, res: Response) =>{
    const key = {
      timezone : req.body.timezone,
      updatedAt : moment().format(Constants.DATE_WITH_TIME_FORMAT)
    };
    const results = await sql.update(`${Tables.USER}`, key, "_id = ?", [req._user._id]);
    if(results){
      res.status(Constants.SUCCESS_CODE).json(ResponseBuilder.successMessage(req.t("SUCCESS")));
    }else{
      res.status(Constants.ERROR_CODE).json(ResponseBuilder.errorMessage(req.t("FAILED")));
    }
  }
}



