const request = require('request');
const Q = require('q');

module.exports = {
    async_getDomainInfo,
}

    // are we registered with SIWC backend?
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
