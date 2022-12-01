const passport = require('passport');
const libUser = require('./user');              // Our User mgt minimal library

// when debuggings
//const SIWWStrategy = require("./siww/index").Strategy;

// using NPM prod passport-wallet strategy
const SIWWStrategy = require("@incubiq/passport-wallet").Strategy;

    let cSIWW = gConfig.siww;

    // special case for localhost, change the secret...
    if(cSIWW.clientID==="localhost") {cSIWW.clientSecret="localhost"}

    // register strategy
    passport.use(new SIWWStrategy({
        clientID: cSIWW.clientID,                                    // our app_id
        clientSecret: cSIWW.clientSecret,                            // our app_secret (only used if enableProof is true)
        callbackURL: gConfig.origin+cSIWW.callbackURL,               // our callback URL
        enableProof: true,                                           // set to true to make use of the app_secret to secure calls (false = unsecured calls)
        authorizationURL: cSIWW.host+ "oauth/dialog/authorize",      // where we call SIWW for authorization (fixed URL)
        tokenURL: cSIWW.host+"oauth/token",                          // where we call SIWW for getting oAuth token (fixed URL)
        profileURL: cSIWW.host+"oauth/resources/profile"             // where we call SIWW for receivinend use's profile (fixed URL)
    },
    function(accessToken, refreshToken, profile, done) {
        try {
            if(!profile) {
                return done(null, false, {});       // got in error...
            }

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
                username: profile.username, 
                firstName: firstName,
                lastName: lastName,
                email: email,
                picture: picture,
                provider_id: profile.provider,
                provider_wallet: profile.wallet,
                wallet_address: profile.wallet_address,
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
    }));


module.exports = passport;
