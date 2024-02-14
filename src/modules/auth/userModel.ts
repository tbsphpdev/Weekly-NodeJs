import { Validate, IsEmail, IsEmpty, IsNotEmpty,IsMobilePhone, IsNumber, isNotEmpty, Matches,Equals, IsArray, IsString, IsBoolean } from "class-validator";
import { Model } from "../../model";

export class SignIn extends Model {
    @IsNotEmpty()
    @IsString()
    public authSub: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    public email : string;

    @IsNotEmpty()
    @IsString()
    public name : string;

    @IsNotEmpty()
    @IsString()
    public image : string;

    @IsNumber()
    public timestamp: number;

    constructor(body: any) {
        super();
        const { authSub, email, name, image, timestamp} = body;
        this.authSub = authSub;
        this.email = email;
        this.name = name;
        this.image = image;
        this.timestamp = timestamp;
    }
}  

export class CreateHabit extends Model {
    @IsNotEmpty()
    @IsString()
    public name : string;

    constructor(body: any) {
        super();
        const {name} = body;
        this.name = name;
    }
} 

export class RenameHabit extends Model {
    @IsNotEmpty()
    @IsString()
    public oldName : string;

    @IsNotEmpty()
    public keepData : string;

    @IsNotEmpty()
    @IsString()
    public name : string;

    constructor(body: any) {
        super();
        const {name, oldName, keepData} = body;
        this.name = name;
        this.keepData = keepData;
        this.oldName = oldName;
    }
} 

export class CreateApplications extends Model {
    @IsNotEmpty()
    @IsString()
    public name : string;

    @IsNotEmpty()
    @IsString()
    public applications : string;

    constructor(body: any) {
        super();
        const {name, applications} = body;
        this.name = name;
        this.applications = applications;
    }
} 

export class UpdateApplications extends Model {
    @IsNotEmpty()
    @IsString()
    public applications : string;

    @IsNotEmpty()
    @IsNumber()
    public applicationId : string;

    constructor(body: any) {
        super();
        const {applicationId, applications} = body;
        this.applications = applications;
        this.applicationId = applicationId;
    }
} 

export class DeleteApplications extends Model {
    @IsNotEmpty()
    @IsNumber()
    public applicationId : string;

    constructor(body: any) {
        super();
        const {applicationId} = body;
        this.applicationId = applicationId;
    }
} 


export class UpdateNotificationSettings extends Model {
    @IsNotEmpty()
    @IsBoolean()
    public allowfriends : boolean;

    @IsNotEmpty()
    @IsBoolean()
    public newfriends : boolean;

    @IsNotEmpty()
    @IsBoolean()
    public acceptingnewreqs : boolean;

    @IsNotEmpty()
    @IsBoolean()
    public messagesoff : boolean;

    @IsNotEmpty()
    @IsBoolean()
    public messagereqs : boolean;

    @IsNotEmpty()
    @IsBoolean()
    public reminders : boolean;

    @IsNotEmpty()
    @IsBoolean()
    public newsemails : boolean;

    @IsNotEmpty()
    @IsBoolean()
    public reminderemails : boolean;

    @IsNotEmpty()
    @IsBoolean()
    public feedbackemails : boolean;

    @IsNotEmpty()
    @IsBoolean()
    public supportemails : boolean;

    constructor(body: any) {
        super();
        const {allowfriends, newfriends, acceptingnewreqs, messagesoff, messagereqs, reminders, newsemails, reminderemails, feedbackemails, supportemails} = body;
        this.allowfriends = allowfriends;
        this.newfriends = newfriends;
        this.acceptingnewreqs = acceptingnewreqs;
        this.messagesoff = messagesoff;
        this.messagereqs = messagereqs;
        this.reminders = reminders;
        this.newsemails = newsemails;
        this.reminderemails = reminderemails;
        this.feedbackemails = feedbackemails;
        this.supportemails = supportemails;
    }
}

export class UpdatePrivacySettings extends Model {
    @IsNotEmpty()
    @IsBoolean()
    public privateaccount : boolean;

    @IsNotEmpty()
    @IsBoolean()
    public competitions : boolean;

    @IsNotEmpty()
    @IsBoolean()
    public onlypeopleyoufollow : boolean;

    constructor(body: any) {
        super();
        const {privateaccount, competitions, onlypeopleyoufollow} = body;
        this.privateaccount = privateaccount;
        this.competitions = competitions;
        this.onlypeopleyoufollow = onlypeopleyoufollow;
    }
}

export class UpdateSettingsData extends Model {
    @IsNotEmpty()
    @IsBoolean()
    public pausetimetracking : boolean;

    @IsNotEmpty()
    @IsBoolean()
    public troubleshooting : boolean;

    @IsNotEmpty()
    @IsBoolean()
    public showdatanoone : boolean;

    @IsNotEmpty()
    @IsString()
    public startworking : string;

    @IsNotEmpty()
    @IsString()
    public stopworking : boolean;

    constructor(body: any) {
        super();
        const {pausetimetracking, troubleshooting, showdatanoone, startworking, stopworking} = body;
        this.pausetimetracking = pausetimetracking;
        this.troubleshooting = troubleshooting;
        this.showdatanoone = showdatanoone;
        this.startworking = startworking;
        this.stopworking = stopworking;
    }
} 

export class SupportsData extends Model {
    @IsNotEmpty()
    @IsString()
    public title : string;

    @IsNotEmpty()
    @IsString()
    public message : string;
    
    constructor(body: any) {
        super();
        const {title, message} = body;
        this.title = title;
        this.message = message;
    }
} 

export class GoalData extends Model {
    @IsNotEmpty()
    @IsNumber()
    public habit : number;

    @IsNotEmpty()
    @IsNumber()
    public productivity : number;

    constructor(body: any) {
        super();
        const {habit, productivity} = body;
        this.habit = habit;
        this.productivity = productivity;
    }
} 