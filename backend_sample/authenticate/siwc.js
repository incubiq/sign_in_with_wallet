
const passport = require('passport');
const SIWCStrategy = require("./siwc/index").Strategy;
const libUser = require('./user');              // Our User mgt minimal library

/*
 *  
 */

    var cSIWC = gConfig.siwc;
    passport.use(new SIWCStrategy({
            clientID: cSIWC.clientID,
            clientSecret: cSIWC.clientSecret,
            callbackURL: gConfig.origin+cSIWC.callbackURL,
            authorizationURL: cSIWC.host+ "oauth/dialog/authorize",
            tokenURL: cSIWC.host+"oauth/token",
            profileURL: cSIWC.host+"oauth/resources/profile"
        },
        function(accessToken, refreshToken, profile, done) {
            try {
                var firstName= profile && profile.name && profile.name.givenName ? profile.name.givenName : profile.displayName.substr(0,profile.displayName.indexOf(" "));
                var lastName= profile && profile.name && profile.name.familyName ? profile.name.familyName : profile.displayName.substr(1+profile.displayName.lastIndexOf(" "), profile.displayName.length);
                var email=profile && profile.emails && profile.emails.length>0 ? (profile.emails[0] ? profile.emails[0].value : null) : null;
                var picture=profile && profile.photos && profile.photos.length>0 ? (profile.photos[0] ? profile.photos[0].value : null) : null;

                // no email??  do not bother creating this user
                if(!email || email.indexOf("@")===-1) {
                    throw {
                        data: null,
                        status: 400,
                        message: "no email"
                    };
                }

                libUser.async_createUser({
                    username: profile.id, // note: profile id  already contains an "authenly_" prefix
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    picture: picture,
                    identity_provider: "SIWC",
                    isValidated: true
                })
                    .then(function(obj){
                        process.nextTick(function () {
                            return done(null, obj.data);
                        });
                    })
                    .catch(function(obj){
                        return done(null, false, obj.data.message);
                    });
            }
            catch (err) {
                return done(null, false, err);
            }

        }
    ));

module.exports = passport;
