
const passport = require('passport');
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const libCookie = require('./cookie'); 
const libUser = require('./user');              // Our User mgt minimal library

/*
 *      Passport ext of JWT
 */

    fnGetJwtFromRequest = function (req) {
        // First look in the cookies
        let token = libCookie.getAuthenticationTokenFromCookie(req);

        // Then look in the header if we found nothing
        if (!token)
            token = ExtractJWT.fromAuthHeaderAsBearerToken()(req);
        return token;
    };

    passport.use(new JWTStrategy({
            jwtFromRequest: fnGetJwtFromRequest,
            secretOrKey: gConfig.jwtKey
        },
        function (jwtPayload, done) {

            libUser.async_findUser({username: jwtPayload.username})
                .then(function(dataUser){

                    // we do not check on expiry...
                    if (dataUser.data && dataUser.data.username) {
                        done(null, jwtPayload);
                    }
                    else {
                        done(null, false);      // no user!!
                    }
                })
                .catch(err => {
                    done(err, false);
                });
        })
    );

module.exports = passport;
