const request = require('request');
const Q = require('q');

// For our calls to the SIWW backend (get basic info / domain info if/when required)

module.exports = {
    async_getInfo,
    async_getDomainInfo,
}

    // Ping SIWW + get secret key for decoding cookies
    function async_getInfo(configSIWC) {
        var deferred = Q.defer();
        request.get(
            configSIWC.host+"api/v1/public",
            function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    deferred.resolve(JSON.parse(body));
                }
                else {
                    deferred.reject({
                        data: null,
                        status: 400,
                        statusText: "Could not access SIWW "
                    });
                }
            }
        ); 
        return deferred.promise;
    }

    // is our domain registered with SIWW backend?
    function async_getDomainInfo(configSIWC) {
        var deferred = Q.defer();
        request.get(
            configSIWC.host+"web3/domain/"+configSIWC.clientID,
            function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    deferred.resolve(JSON.parse(body));
                }
                else {
                    deferred.reject({
                        data: null,
                        status: 400,
                        statusText: "Could not find domain "+ configSIWC.clientID
                    });
                }
            }
        ); 
        return deferred.promise;
    }
    