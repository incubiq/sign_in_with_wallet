
const jsonwebtoken = require("jsonwebtoken");

module.exports = {
    getCookieName,
    getCookieOptions,
    createToken
};

/*
 *      Our JWT lib
 */

    // name our cookie
    function getCookieName() {
        if(gConfig.isDebug) {
            return "jwt_DEBUG_token_"+gConfig.appName;
        }
        return "jwt_token_"+gConfig.appName;
    }

    // same site cookie info...
    function getCookieOptions() {
        var objOptions= {
            sameSite: "Lax"
        };
        if(!gConfig.isDebug){
            objOptions.secure=true;
        }
        return objOptions
    }

    // JWT signed payload 
    function createToken(req) {
        let payload = {username: (req!=null && req.user!=null && req.user.username!=null) ? req.user.username.toString() : null};
        return jsonwebtoken.sign(payload, gConfig.jwtKey, {
            expiresIn: gConfig.authentication_expire
        });
    }
