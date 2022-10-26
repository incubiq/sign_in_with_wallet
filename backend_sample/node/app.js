const root='../';
const sampleApp='./';
const siwcApp='./siwc/';
const express = require('express');

/*
 *      App Inits
 */

    module.exports = {
        createApp,
        initializeApp
    };

    function createApp() {
        return express();
    }

    function initializeApp(objParam) {
        let app=objParam.app;
        let config=objParam.config;

        const cors = require('cors');
        const bodyParser= require('body-parser');
        const cookieParser=require('cookie-parser');
        const cookieSession=require('cookie-session');
        const passport = require('passport');

        // our auth token
        const authToken = require(sampleApp+'authenticate/token');

        // set the accepted access-control-allow-methods
        app.use(cors({
            methods: ["OPTIONS", "PUT", "GET", "POST", "PATCH", "DELETE", "LINK", "UNLINK"]
        }));

        app.use(cookieParser());
        app.use(cookieSession({
            name: config.appName,                  // name of cookie session
            keys: [config.jwtKey],                 // key to encode cookie
            cookie: authToken.getCookieOptions()    // the authentication cookie
        }));

        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json({limit: '50mb'})); 
        app.use(require('express-session')({
            secret: config.jwtKey,
            name: config.appName,
            resave: true,
            saveUninitialized: true,
            cookie : {
                sameSite: 'Lax'
            }
        }));
        app.use(passport.initialize());
        app.use(passport.session());

        // ensure we are registered with SIWW for authentication sessions        
        const regSIWW = require('./authenticate/services_siww');        
        regSIWW.async_getDomainInfo(gConfig.siww)
            .then(function(_dataDomain){

                if(!_dataDomain || !_dataDomain.data || _dataDomain.data.app_id!==gConfig.siww.clientID) {
                    throw {
                        data: null,
                        status: 400,
                        statusText: "SIWW does not know me..."
                    }

                }
                else {
                    // only register routes after we have guarantee SIWW know us
                    initializeRedirections(app);
                    initializeRoutes(app);
                    initializeViews(app);        
                }
            })
            .catch(function(err) {
                console.log(err.statusText);
                console.log("Stopping init...");
            });
    }

/*
 *      App security
 */

    function initializeRedirections(app) {

        // change header security requirements here
        const objHeaders= {
            headers: {
                "X-Content-Type-Options": "nosniff",
                "X-XSS-Protection": "1; mode=block",
                "Content-Security-Policy":
                    gConfig.isDebug?
                        "default-src 'self' 'unsafe-eval' data: http://localhost:"+gConfig.port +" ; " +
                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:"+gConfig.port +" ; " +
                        "style-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:"+gConfig.port +" ; " +
                        "font-src  http://localhost:"+gConfig.port +" ; " +
                        "connect-src ws://localhost:"+gConfig.port +" http://localhost:"+gConfig.port +" 'self'; " +
                        "worker-src blob: ; " +
                        "img-src 'self' data: https: localhost:"+gConfig.port +" ; " +
                        "frame-src 'self' "
                        :
                        "default-src tachiku: 'self' 'unsafe-eval' data: ; " +
                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' ; " +
                        "style-src 'self' 'unsafe-eval' 'unsafe-inline' data: ; " +
                        "font-src ; " +
                        "connect-src  'self'; " +
                        "worker-src blob: ; " +
                        "img-src 'self' data: ; " +
                        "frame-src 'self' ;"
            }
        }

        app.all('/*', function (req, res, next) {

            var strAllow="Origin, X-Requested-With, charset, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials";
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, PATCH, DELETE, OPTIONS, LINK, UNLINK');

            // override origin?
            if(objHeaders.headers.hasOwnProperty("Access-Control-Allow-Origin")) {
                res.header("Access-Control-Allow-Origin", objHeaders.headers["Access-Control-Allow-Origin"]);
            }
            if(objHeaders.headers.hasOwnProperty("X-Content-Type-Options")) {
                res.header("X-Content-Type-Options", objHeaders.headers["X-Content-Type-Options"]);
            }
            if(objHeaders.headers.hasOwnProperty("X-XSS-Protection")) {
                res.header("X-XSS-Protection", objHeaders.headers["X-XSS-Protection"]);
            }
            if(objHeaders.headers.hasOwnProperty("X-Frame-Options")) {
                res.header("X-Frame-Options", objHeaders.headers["X-Frame-Options"]);
            }
            if(objHeaders.headers.hasOwnProperty("Content-Security-Policy")) {
                res.header("Content-Security-Policy", objHeaders.headers["Content-Security-Policy"]);
            }

            for (var prop in objHeaders.headers) {
                if (Object.prototype.hasOwnProperty.call(objHeaders.headers, prop)) {
                    strAllow=strAllow+", "+prop;
                }
            }

            res.removeHeader('X-Powered-By');
            res.header("Access-Control-Allow-Headers", strAllow);
            res.header('Pragma', "no-cache");
            res.header('Cache-Control', "private, no-cache, no-store, must-revalidate");
            res.header("Strict-Transport-Security", "max-age=31536000");        // to force HTTPS 
            next();
        });
    }

/*
 *      App routes (incl. authentication routes)
 */

    function initializeRoutes(app) {

        //
        // Routes for SIWC backend (would normally be on separate server)
        //
        /*
        const passportJwtSIWC = require(siwcApp+'authenticate/jwt');      // same passport JWT in both (client AND oAuth server)
        const routeOAuth = require(siwcApp+'routes/route_oauth2');
        const routeOAuthRes = require(siwcApp+'routes/route_oauth2_resources');

        // oauth2 server for sign-in from target websites
        app.use('/oauth', routeOAuth);
        app.use('/oauth/resources',
            fnNoRedirect,
            passportJwtSIWC.authenticate('jwt', {
                session: false,
            }),
            routeOAuthRes
        );
        */

        // 
        // Routes for SAMPLE APP
        //
        const passportJwt = require(sampleApp+'authenticate/jwt');
        const routeAuth = require(sampleApp+'routes/route_auth');
        const routePublicAPI = require(sampleApp+'routes/route_public');
        const routePrivateAPI = require(sampleApp+'routes/route_private');
        const routeWebsite = require(sampleApp+'routes/route_website');
        const routeApp = require(sampleApp+'routes/route_app');

        // If we don't want to redirect on authentication error...
        const fnNoRedirect = function (req, res, next) {
            req.noRedirect = true;
            next();
        };

        // authentication route
        app.use('/auth', routeAuth);

        // public route
        app.use('/api/v1/public', routePublicAPI);

        // sample private apis...
        app.use('/api/v1/private',
            fnNoRedirect,
            passportJwt.authenticate('jwt', {
                session: false,
            }),
            routePrivateAPI
        );

        // app after login
        app.use('/app', 
            passportJwt.authenticate('jwt', {
                session: false,
                failureRedirect: '/auth/unauthorized'
            }), 
            routeApp
        );

        // website
        app.use('/', routeWebsite);
    }

    function initializeViews(app) {

        /* CONNECT TO REACT APP */
        const express = require('express');
        const path = require('path');
        const exphbs = require('express-handlebars-multi');

        let indexProd="../../react/build/"         // this is where we get all static files from REACT app (if want to debug app with backend calls, run it from localhost:3000, not from here)
        let dirApp=path.join(__dirname, sampleApp);        
        let dirASsets=path.join(__dirname, "../");        
        app.use('/assets', express.static(path.join(dirASsets, 'assets')));

        let tmpPath=path.join(__dirname, indexProd);        
        app.use('/app', express.static(tmpPath));
        app.use('/app/*', express.static(tmpPath));

        var aLayout=[path.join(dirApp, 'views/layouts/')];
        var aPartial=[path.join(dirApp, 'views/partials/')];
        var aView=[path.join(dirApp, 'views/')];
        var hbs = exphbs({
            ext: '.hbs',
            layoutDirs: aLayout,
            partialDirs: aPartial,
            helpers: {
                ifCond: function (v1, operator, v2, options) {
                    switch (operator) {
                        case '==':
                            return (v1 == v2) ? options.fn(this) : options.inverse(this);
                        case '!=':
                            return (v1 != v2) ? options.fn(this) : options.inverse(this);
                        case '===':
                            return (v1 === v2) ? options.fn(this) : options.inverse(this);
                        case "!==":
                            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                        case '<':
                            return (v1 < v2) ? options.fn(this) : options.inverse(this);
                        case '<=':
                            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                        case '>':
                            return (v1 > v2) ? options.fn(this) : options.inverse(this);
                        case '>=':
                            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                        case '&&':
                            return (v1 && v2) ? options.fn(this) : options.inverse(this);
                        case '||':
                            return (v1 || v2) ? options.fn(this) : options.inverse(this);
                        default:
                            return options.inverse(this);
                    }
                },
                encode: function(value) {
                    return encodeURIComponent(encodeURIComponent(value));
                }
            }
        });
        app.engine('.hbs', hbs);
        app.set('view engine', '.hbs');
        app.set('views', aView);

        // static files..
        app.use(express.static(path.join(__dirname, root)));            

        // catch and forward specific error handler
        app.use(function (req, res, next) {
            var title = "Cracked!";
            var message = "There's no page in this place!";
            var status = "@#!";
            res.status(404);
            res.render("page_error", {
                layout: 'marketing',
                config: gConfig,
                metadata: {
                    type: "article",
                    pathname: req.url,
                    author: gConfig.email,
                    keywords: "",
                    description: "",
                    title: "Error"
                },
                title: title,
                background: '/assets/background_error.jpeg',
                content: "<div>We have reached the deep seas...</div>" +
                    "<div>" + message + "</div>" +
                    "<div>Error code: " + status + "</div>"
            });
        })        
        
    }
