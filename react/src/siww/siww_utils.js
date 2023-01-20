
import { randomStringForEntropy } from '@stablelib/random';    

/*
 *      Sign-In With Wallet / Utilities
 */


    // to avoid being stuck in a request for an unresponsive wallet
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
    export const checkIsValidDomain = (url) => { 
        if(!url) {return false}

        //remove all http:// or https:// in front...
        url = url.toLowerCase();
        if (url.substr(0, 7) === "http://") {
            url = url.substr(7, url.length);
        } else {
            if (url.substr(0, 8) === "https://") {
                url = url.substr(8, url.length);
            }
        }

        var re = new RegExp(/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/);
        if (url.match(re) && url.split(".").length-1 === 1) {
            return true;
        }
        
        if(url === "localhost" || url.substr(0,10) === "localhost:") {
            return true;
        }
        return false;
    } 

    // statements must not have \n (hiding some text that user will not see until scroll)
    export const checkIsValidStatement = (_str) => { 
        let _isValid=(_str!==null && !(_str.includes("\n")));
        if(!_isValid) {console.log("invalid message: "+_str)}
        return _isValid;
    } 

    // chain must be accepted
    export const checkIsValidChain = (_chain, aAcceptedChains) => { 
        if(!aAcceptedChains || !_chain) {return false}
        let _isValid=aAcceptedChains.some(item => item.name.toLowerCase() === _chain.toLowerCase());;        
        if(!_isValid) {console.log("invalid chain: "+_chain)}
        return _isValid;
    } 

    // date must be valid and still active
    export const checkIsValidDate = (_dateFromUTC, _secDuration) => { 
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
