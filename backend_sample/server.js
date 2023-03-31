
/*
 *      Config
 */

let _port=3003;

// global config params of backend server app
global.gConfig={

    // web domain
    port: _port,                         // port on which backend will run (when in debug mode)
    origin: "http://localhost:"+_port+"/",      // test with LOCAL SIWW server

    // cookie / auth
    appName: "TestApp_LoginSIWC",       // app Name used for naming the cookie
    jwtKey: "any_secret_will_do",       // some basic key for encoding cookies (will get it from SIWW)
    authentication_expire: "72h",       // 72 hours expiration of our cookie

    // params for the SIWW session (includes where SIWW is hosted)
    siww: {

        clientSecret: "",                       // get it from params at launch
        callbackURL:"auth/siww/callback",

        // test with LOCAL SIWW server
//        clientID: "localhost",
        clientID: "7TdKmdPQ1663168239000",
        host: "http://localhost:3010/",
        domain: "localhost:3010",
    },

    // misc
    isDebug: true,                      // change to false for PROD version
    version: "0.1.1"
};

// just to check all arguments passed by node
process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
    if(index==2) {
        if(val.substr(0,4)=="env=") {
            process.env.NODE_ENV=val.substr(4, val.length);           // set the config if passed in param
        }
         
        if(val.substr(0,4)=="ENV=") {
            var _config = require('./'+val.substr(4, val.length));
            global.gConfig.siww.clientSecret=_config.APP_SECRET;
            if(_config.PROD) {
                global.gConfig.siww.clientID="localhost";
                global.gConfig.siww.host="https://signwithwallet.com/";
                global.gConfig.siww.domain="signwithwallet.com";        
                global.gConfig.origin=_config.NGROK;
                console.log("Configured for prod");
            }
            else {
                console.log("Configured for local");
            }
        }
    }
});

/*
 *      App
 */

const http = require('http');
const module_app = require('./node/app');       // to start the app in debug or prod...

let app = module_app.createApp();
app.set('port', gConfig.port);
app.enable('trust proxy');

let server = http.createServer(app);
server.listen(gConfig.port);
console.log("Localhost running on port "+gConfig.port);
console.log("Sample app running here:  "+global.gConfig.origin);
console.log("SIWW located here:  "+global.gConfig.siww.host);

module_app.initializeApp({
    app: app,
    config: gConfig
});

process.on('uncaughtException', function (err) {
    console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
    console.error(err.stack);
    process.exit(1);
});
