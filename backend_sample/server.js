
process.env.NODE_ENV = 'prod';

/*
 *      Config
 */

// global config params of backend server app
let _port=3003;
global.gConfig={
    // web domain
    port: _port,                         // port on which backend will run (when in debug mode)
    origin: "http://localhost:"+_port+"/",

    // cookie / auth
    appName: "TestApp_LoginSIWC",       // app Name used for naming the cookie
    jwtKey: "",                         // some basic key for encoding cookies (will get it from SIWW)
    authentication_expire: "72h",       // 72 hours expiration of our cookie

    // params for the SIWW session (includes where SIWW is hosted)
    siww: {
        clientID: "7TdKmdPQ1663168239000",
        clientSecret: "",                       // get it from params at launch
        callbackURL:"auth/siww/callback",
        host: "http://localhost:3010/",         // change this later... (will need https:// when on final server)
        domain: "localhost:3010"
    },

    // misc
    isDebug: true,                      // change to false to test PROD version
    version: "0.1.0"
};


// just to check all arguments passed by node
process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
    if(index==2) {
        if(val.substr(0,4)=="env=") {
            process.env.NODE_ENV=val.substr(4, val.length);           // set the config if passed in param
        }
        if(val.substr(0,11)=="app_secret=") {
            gConfig.siww.clientSecret=val.substr(11, val.length);
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
console.log("Running on port "+gConfig.port);

module_app.initializeApp({
    app: app,
    env: process.env.NODE_ENV,
    config: gConfig
});

process.on('uncaughtException', function (err) {
    console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
    console.error(err.stack);
    process.exit(1);
});
