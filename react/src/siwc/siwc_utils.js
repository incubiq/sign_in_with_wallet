
import { randomStringForEntropy } from '@stablelib/random';    

/*
 *      Sign-In With Cardano / Utilities
 */

    // to avoind being stuck in a request for an unresponsive wallet
    export const replyFast = async (_waitTimeMs, fn, ...args) => {        
        let p=new Promise(function(resolve, reject) {
            setTimeout(function(){
                reject('timeout');
            },_waitTimeMs)

            fn(...args)
                .then(function(data){
                    resolve(data);
                })
                .catch(function(err){
                    reject(err);
                })                
        });
        return p;
    }

    // domain name must be valid
    export const checkIsValidDomain = (domain) => { 
        let _isValid=(domain!==null);
        if(_isValid) {            
            var re = new RegExp(/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/); 
            _isValid=domain.match(re) || (domain==="localhost" || domain==="localhost:3000" || domain==="localhost:3001");
        }
        if(!_isValid) {console.log("invalid domain: "+domain)}
        return _isValid;
    } 

    // statements must not have \n (hiding some text that user will not see until scroll)
    export const checkIsValidStatement = (_str) => { 
        let _isValid=(_str!==null && !(_str.includes("\n")));
        if(!_isValid) {console.log("invalid message: "+_str)}
        return _isValid;
    } 

    // chain must be cardano mainnet or testnet
    export const checkIsValidChain = (_chain) => { 
        let _isValid=_chain!==null && (_chain==="Cardano mainnet" || _chain==="Cardano testnet");
        if(!_isValid) {console.log("invalid chain: "+_chain)}
        return _isValid;
    } 

    // date must be valid and still active
    export const checkIsDateValid = (_dateFromUTC, _secDuration) => { 
        let _isValid=(_dateFromUTC && _secDuration && _secDuration>0);        // minimum of good params in
        if(_isValid) {
            let now = new Date(); 
            let nowUtc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
            let untilUtc = new Date(_dateFromUTC.getTime() + _secDuration*1000);
            _isValid=nowUtc < untilUtc;
        }
        if(!_isValid) {console.log("invalid date or period")}
        return _isValid;
    }     
    
    export const generateNonce = () => {
        return randomStringForEntropy(96);
    }
