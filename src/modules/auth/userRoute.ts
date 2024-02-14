import {Router} from "express";
import {Middleware} from "../../middleware";
import { Validator } from "../../validate";
import { UserController } from "./userController";
import { UserMiddleware } from "./userMiddleware";
import { Constants } from "../../config/constants";
import { SignIn, CreateHabit, RenameHabit, CreateApplications, UpdateNotificationSettings, UpdatePrivacySettings, UpdateSettingsData, SupportsData, GoalData, UpdateApplications, DeleteApplications } from "./userModel";

const router: Router = Router();
const v: Validator = new Validator();
const userController = new UserController();
const userMiddleware = new UserMiddleware();
const middleware = new Middleware();

router.post(Constants.ROUTES.SIGNIN, v.validate(SignIn), userMiddleware.checkUser, userMiddleware.getDefaultSubscritpion, userController.socialLogin);

router.get(Constants.ROUTES.FIND_USER, middleware.authenticateUser, userMiddleware.getUserDetails, userMiddleware.getUserSubscription ,userMiddleware.getNotificationCount, userMiddleware.getUserOwnCompete, userController.getProfile);

router.post(Constants.ROUTES.CREATE_HABIT, middleware.authenticateUser, v.validate(CreateHabit), userMiddleware.ishabitExist ,userController.createHabit);

router.post(Constants.ROUTES.RENAME_HABIT, middleware.authenticateUser, v.validate(RenameHabit),userMiddleware.checkOldHabits, userController.updateHabit);

router.post(Constants.ROUTES.DELETE_HABIT, middleware.authenticateUser, v.validate(CreateHabit), userMiddleware.checkHabits, userController.deleteHabit);

router.post(Constants.ROUTES.ADD_APPLICATION, middleware.authenticateUser, v.validate(CreateApplications), userMiddleware.checkHabits, userMiddleware.isApplicationExist, userMiddleware.getUserSubscription, userMiddleware.getHabitApplicationCount ,userController.addApplication);

router.post(Constants.ROUTES.UPDATE_APPLICATION, middleware.authenticateUser, v.validate(UpdateApplications), userMiddleware.getApplicationById, userMiddleware.isApplicationExist, userController.updateApplication);

router.post(Constants.ROUTES.DELETE_APPLICATION, middleware.authenticateUser, v.validate(DeleteApplications), userMiddleware.getApplicationById, userController.deleteApplication);

router.get(Constants.ROUTES.GET_HABIT, middleware.authenticateUser, userMiddleware.getAllHabits, userController.userHabits);

router.get(Constants.ROUTES.GET_HABIT_DETAILS, middleware.authenticateUser, userMiddleware.getApplicationByHabit, userController.userApplications);

router.post(Constants.ROUTES.UPDATE_NOTIFICATION_SETTINGS, middleware.authenticateUser, v.validate(UpdateNotificationSettings), userController.updateNotificationSettings);

router.post(Constants.ROUTES.UPDATE_PRIVACY_SETTINGS, middleware.authenticateUser, v.validate(UpdatePrivacySettings), userController.updatePrivacySettings);

router.post(Constants.ROUTES.UPDATE_SETTINGS_DATA, middleware.authenticateUser, v.validate(UpdateSettingsData), userController.updateSettingsData);

router.get(Constants.ROUTES.DEACTIVATE_ACCOUNT, middleware.authenticateUser, userMiddleware.getUserSubscription, userController.deactivateAccount);

router.post(Constants.ROUTES.REPORT, middleware.authenticateUser, v.validate(SupportsData), userController.reportIssues);

router.post(Constants.ROUTES.UPLOAD_PROFILE_IMAGE, middleware.authenticateUser, userController.uploadProfileImage);

router.post(Constants.ROUTES.ADD_GOAL, middleware.authenticateUser, v.validate(GoalData), userController.addGoalData);

router.get(Constants.ROUTES.CHECK_APPLICATION, middleware.authenticateUser, userMiddleware.getApplicationAllHabits, userController.applicationHabits);

router.get(Constants.ROUTES.REFRESH_TOKEN, middleware.generateNewToken);

router.get(Constants.ROUTES.TEST_NOTIFICATION, userController.checkNotification);

router.get(Constants.ROUTES.RECOVER_ACCOUNT, middleware.authenticateUser, userController.recoverUserAccount);

router.post(Constants.ROUTES.UPDATE_TIME_ZONE, middleware.authenticateUser, userController.updateProfile);

export const UserRoute: Router = router;