import request from "request";
import { Constants } from "../config/constants";
import { Jwt } from "../helpers/jwt";


export class AuthServices {
    public static async checkGoogleAuth(providerInfo) {
        return new Promise((resolve, reject) => {
            const { appId, accessToken } = providerInfo;
            request(`${Constants.GOOGLE_OAUTH_URL}${accessToken}`,
                (error, response, data) => {
                    if (error) {
                        reject(error);
                    }
                    const me = JSON.parse(data); 
                    if (response.statusCode === 200 && (me.user_id === appId || me.sub === appId)) {
                        resolve({
                            statusCode: response.statusCode,
                            data: JSON.parse(response.body),
                        });
                    } else {
                        resolve({
                            statusCode: response.statusMessage,
                        })
                    }
                });
        });
    }
}
