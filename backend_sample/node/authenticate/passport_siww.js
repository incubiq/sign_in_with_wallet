const passport = require('passport');
const libUser = require('./user');              // Our User mgt minimal library

const SIWWStrategy = require("./siww/index").Strategy;                    // when debugging, use the local strategy
//const SIWWStrategy = require("@incubiq/passport-wallet").Strategy;          // normal case, using NPM prod passport-wallet strategy

/*
 *      Making use of passport-wallet authentication strategy
 */

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

            let firstName= profile && profile.name && profile.name.givenName ? profile.name.givenName : profile.displayName.substr(0,profile.displayName.indexOf(" "));
            let lastName= profile && profile.name && profile.name.familyName ? profile.name.familyName : profile.displayName.substr(1+profile.displayName.lastIndexOf(" "), profile.displayName.length);
            let email=profile && profile.emails && profile.emails.length>0 ? (profile.emails[0] ? profile.emails[0].value : null) : null;
            let picture=profile && profile.photos && profile.photos.length>0 ? (profile.photos[0] ? profile.photos[0].value : null) : null;
            let wallet_address= profile && profile.wallet_address ? profile.wallet_address : null;
            let authorizations= profile && profile.authorizations? profile.authorizations : [];

            // TODO define what to validate here

            // happy with validations? Create the user
            libUser.async_createUser({
                username: profile.username, 
                firstName: firstName,
                lastName: lastName,
                email: email,
                picture: picture,
                connector: profile.connector,
                blockchain_symbol: profile.blockchain_symbol,
                provider_wallet: profile.wallet,
                wallet_address: wallet_address,
                authorizations: authorizations,
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
