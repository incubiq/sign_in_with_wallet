
const express = require('express');
const router = express.Router();
const authToken = require('../authenticate/token');
const passportSIWW = require("../authenticate/passport_siww");    
const libUser = require('../authenticate/user');              // Our User mgt minimal library

/*
 *      Authentication routes
 */

    var _completeLogin=function(req, res){

        // make the auth cookie
        let token=authToken.createToken(req);
        res.cookie(authToken.getCookieName(), token, authToken.getCookieOptions());       // store this cookie

        // ensure no cache on this redirect
        res.redirect('/app');
    };

// ************************************************
//      Real authentication starts here!
// ************************************************

    router.get('/siww',passport.authenticate('SIWW', {session: false}));        // will call SIWW /oauth/dialog/authorize
    router.get('/siww/callback', passportSIWW.authenticate('SIWW', {
        failureRedirect: '/auth/unauthorized',
        session: false
    }), function (req, res) {
        _completeLogin(req, res);
    });

    //
    router.get('/isauthorized', function (req, res, next) {
        // return object indicating user authorization
        libUser.async_getUserInfoFromCookie(req, gConfig.jwtKey)
            .then(function(objInfo){
                res.json(objInfo);
                res.end();
            });
    });

    // web page rendering
    router.get('/unauthorized', function (req, res, next) {
        // make sure we remove any old authorization cookie ...
        res.clearCookie(authToken.getCookieName(), authToken.getCookieOptions());

        res.render("page_error", {
            layout: 'marketing',
            config: gConfig,
            metadata: {
                type: "article",
                pathname: req.route.path,
                author: gConfig.email,
                keywords: gConfig.appName +", unauthorized",
                description: "",
                title: gConfig.appName+" - sorry, unauthorized!",
                image: "/assets/images/logo.jpg"
            },
            title: "Oh dear!",
            background: "/assets/background_error.jpeg",
            content: "<div>Looks like you were not authorized to access this page!</div>" +
                '<a href="/auth/prepare/siwc"><div class="signin-btn btn social-btn btn-primary" style="background-color: #28c4cc;" tabindex="5">Sign In With Wallet</div></a>'
        });
    });

    // api call
    router.get('/unauthorized_api', function (req, res, next) {
        res.status(401);
        res.json({
            data: {
                status: "Unauthorized access!",
                warning: "What made you think you could call this?"
            }
        });
    });

    // A really dummy authentication....
    const passport = require('passport');
    router.post('/silentauth', (req, res, next) => {
        passport.authenticate('local',
        (err, user, info) => {
            if (err || !req.body.username) {
                return next({
                    data: null,
                    message: "Could not login",
                    status: 400
                });
            }
        
            // fake a user
            req.user={
                username: req.body.username
            };

            // create user...

            // log user
            _completeLogin(req, res);

        })(req, res, next);
    });
        
module.exports = router;