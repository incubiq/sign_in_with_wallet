
const express = require('express');
const router = express.Router();
const routeBase = require('./utils');
const authToken = require('../authenticate/token');
const passportSIWC = require("../authenticate/passport_siwc");
const regSIWC = require('../authenticate/register_siwc');
const libCookie = require('../authenticate/user');              // Our User mgt minimal library
const Q = require('q');
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

    // A really dummy authentication for now....
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

// ************************************************
//      Real authentication starts here!
// ************************************************
    router.get('/prepare/siwc', function(req, res, next) {
        
        let fnReg=function() {
            var deferred = Q.defer();
            regSIWC.async_isRegisteredDomain(gConfig.siwc)
                .then(_dataIsReg => {
                    if(_dataIsReg.data && _dataIsReg.data.isRegistered===true) {
                        deferred.resolve();
                    }
                    else {
                        // need to register again!!
                        regSIWC.async_registerDomain(gConfig.siwc)
                            .then(_dataDomain => {
                                
                                // TODO !! restart the passport siwc

                                // redirect
                                deferred.resolve();
                            })
                            .catch(err => {
                                deferred.reject();
                            });
                    }
                })
                .catch(err => {
                    deferred.reject();
                });
            return deferred.promise;
        }

        // ensure we have connection with SIWC
        fnReg().then(function(){
            res.redirect("/auth/siwc");
        })
    });

    router.get('/siwc', passportSIWC.authenticate('SIWC', {session: false}));
    router.get('/siwc/callback', passportSIWC.authenticate('SIWC', {
        failureRedirect: '/auth/unauthorized',
        session: false
    }), function (req, res) {
        _completeLogin(req, res);
    });


    //
    router.get('/isauthorized', function (req, res, next) {
        // return object indicating user authorization
        libCookie.async_getUserInfoFromCookie(req, gConfig.jwtKey)
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
                image: "/images/logo_256x256.jpg"
            },
            title: "Oh dear!",
            content: "<div>Looks like you were not authorized to access this page!</div>" +
                "<div>Try <a href='/login'>login</a> again?</div>"
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

module.exports = router;
