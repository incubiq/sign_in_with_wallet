
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
        let payload = {
            username: (req!=null && req.user!=null && req.user.username!=null) ? req.user.username.toString() : null,
            provider: (req!=null && req.user!=null && req.user.provider_id!=null) ? req.user.provider_id : null,
            authorizations: (req!=null && req.user!=null && req.user.authorizations!=null) ? req.user.authorizations : null,
            provider_wallet: (req!=null && req.user!=null && req.user.provider_wallet!=null) ? req.user.provider_wallet : null,
            wallet_address: (req!=null && req.user!=null && req.user.wallet_address!=null) ? req.user.wallet_address : null,
            firstName: (req!=null && req.user!=null && req.user.firstName!=null) ? req.user.firstName : null,
            lastName: (req!=null && req.user!=null && req.user.lastName!=null) ? req.user.lastName : null,
            email: (req!=null && req.user!=null && req.user.email!=null) ? req.user.email : null,
        };
        return jsonwebtoken.sign(payload, gConfig.jwtKey, {
            expiresIn: gConfig.authentication_expire
        });
    }
