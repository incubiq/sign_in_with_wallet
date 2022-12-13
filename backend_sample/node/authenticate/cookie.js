
/*
 *      Extract info from Cookie
 */

const authToken = require("./token");
const Q = require('q');
const jsonwebtoken = require("jsonwebtoken");

module.exports = {
    getAuthenticationTokenFromCookie,
    async_getUserInfoFromCookie,
};

/*
 *      Very basic user Mgt (no database)
 */

    // read the Auth token inside the cookie
    function getAuthenticationTokenFromCookie(req) {
        var token = null;
        if (req && req.cookies) {
            token = req.cookies[authToken.getCookieName()];
        }
        return token;
    }

    // read the User details inside the cookie
    async function async_getUserInfoFromCookie(req, secret) {
        var deferred = Q.defer();
        var token = getAuthenticationTokenFromCookie(req);
        if (token) {
            jsonwebtoken.verify(token, secret, function(err, decoded){
                if(err) {
                    deferred.resolve({
                        data: {
                            isAuthenticated: false,
                            isExpired: false,
                            user: null
                        }
                    });
                }
                else {
                    // here we could check user against this app's DB and possibly retrieve extra info...

                    let _objUser={
                        isAuthenticated: true,
                        isExpired: false,
                        username: decoded.username,
                        provider: decoded.provider,
                        wallet_id: decoded.provider_wallet,
                        wallet_address:  decoded.wallet_address,
                        authorizations: decoded.authorizations
                    }

                    deferred.resolve({
                        data: _objUser                        
                    });
                }
            });
        }
        else {
            deferred.resolve({
                data: null,
                status: 401,
                message: "no cookie found"
            });
        }
        return deferred.promise;
    }
