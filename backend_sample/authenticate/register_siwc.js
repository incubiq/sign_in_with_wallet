const request = require('request');
const Q = require('q');

module.exports = {
    async_isRegisteredDomain,
    async_registerDomain
}

    // are we registered with SIWC backend?
    function async_isRegisteredDomain(configSIWC) {
        var deferred = Q.defer();
        request.get(
            configSIWC.host+"web3/domain/"+configSIWC.client_id,
            function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    deferred.resolve(body);
                }
                else {
                    deferred.reject({
                        data: null,
                        status: 400,
                        statusText: "Could not check registered domain with SIWC"
                    });
                }
            }
        ); 
        return deferred.promise;
    }

    // register with SIWC backend
    function async_registerDomain(configSIWC) {
        var deferred = Q.defer();
        request.post(
            configSIWC.host+"web3/domain", { 
                json: { 
                    // who are we?
                    domain: gConfig.origin,

                    // display
                    display_name: "test app",
                    background: null,           // overload later...
                    logo: null,                 // overload later...

                    // callbacks
                    onSuccess: configSIWC.callbackURL,
                    onError: function(){},
                    
                    // token
                    token_lifespan:  3*24*60*60*1000,  // 3 day default
                    scope: "username wallet_address"
                } 
            },
            function (error, response, body) {
                if (!error && response.statusCode === 201) {
                    deferred.resolve(body);
                }
                else {
                    deferred.reject({
                        data: null,
                        status: 400,
                        statusText: "Could not register domain with SIWC"
                    });
                }
            }
        ); 
        
        return deferred.promise;
    }
