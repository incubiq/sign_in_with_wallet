
const express = require('express');
const router = express.Router();
const authToken = require('../authenticate/token');
const passportSIWW = require("../authenticate/passport_siww");    

/*
 *      Authentication routes
 */

    // login via passport-wallet + SIWW
    router.get('/siww',passportSIWW.authenticate('SIWW', {session: false}));        // will call SIWW /oauth/dialog/authorize
    router.get('/siww/callback', passportSIWW.authenticate('SIWW', {
        failureRedirect: '/auth/unauthorized',
        session: false
    }), function (req, res) {

        // make the auth cookie and redirect
        let token=authToken.createToken(req);
        res.cookie(authToken.getCookieName(), token, authToken.getCookieOptions());       // store this cookie
        res.redirect('/app');
    });

    // logout of sample app
    router.get('/logout', function (req, res, next) {

        // make sure we remove any old authorization cookie ...
        res.clearCookie(authToken.getCookieName(), authToken.getCookieOptions());
        res.redirect('/');
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
                '<a href="/auth/siww"><div class="signin-btn btn social-btn btn-primary" style="background-color: #28c4cc;" tabindex="5">Login again...</div></a>'
        });
    });

module.exports = router;
