
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
                    // here we could check user against DB and possibly retrieve extra info...
                    deferred.resolve({
                        data: {
                            isAuthenticated: true,
                            isExpired: false,
                            username: decoded.username    
                        }
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
