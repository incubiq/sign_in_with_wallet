const passport = require('passport');
const libUser = require('./user');              // Our User mgt minimal library
const SIWWStrategy = require("./siww/index").Strategy;

module.exports = {
    getNewStrategy
}

/*
 *          Strategy for the SIWW passport
 */

    function getNewStrategy () {
        
        let cSIWW = gConfig.siww;
        return new SIWWStrategy({
            clientID: cSIWW.clientID,
            clientSecret: cSIWW.clientSecret,
            callbackURL: gConfig.origin+cSIWW.callbackURL,
            authorizationURL: cSIWW.host+ "oauth/dialog/authorize",
            tokenURL: cSIWW.host+"oauth/token",
            profileURL: cSIWW.host+"oauth/resources/profile"
        },
        function(accessToken, refreshToken, profile, done) {
            try {
                var firstName= profile && profile.name && profile.name.givenName ? profile.name.givenName : profile.displayName.substr(0,profile.displayName.indexOf(" "));
                var lastName= profile && profile.name && profile.name.familyName ? profile.name.familyName : profile.displayName.substr(1+profile.displayName.lastIndexOf(" "), profile.displayName.length);
                var email=profile && profile.emails && profile.emails.length>0 ? (profile.emails[0] ? profile.emails[0].value : null) : null;
                var picture=profile && profile.photos && profile.photos.length>0 ? (profile.photos[0] ? profile.photos[0].value : null) : null;
    
                // TODO define what to validate here
                /*
                if(!email || email.indexOf("@")===-1) {
                    throw {
                        data: null,
                        status: 400,
                        statusText: "no email"
                    };
                }
                */
    
                libUser.async_createUser({
                    username: profile.id, // note: profile id  already contains an "SIWW_" prefix
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    picture: picture,
                    identity_provider: "SIWW",
                    isValidated: true
                })
                    .then(function(obj){
                        process.nextTick(function () {
                            return done(null, obj.data);
                        });
                    })
                    .catch(function(obj){
                        return done(null, false, obj.statusText);
                    });
            }
            catch (err) {
                return done(null, false, err);
            }
        })
    }

 