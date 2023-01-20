/*
 *      Sign-In With Wallet - Multi wallet Entry point
 */

import {siwc_connect} from "./siwc_connect"
import {siwm_connect} from "./siwm_connect"


const siwc=new siwc_connect();
const siwm=new siwm_connect();
let aConnector=[siwc, siwm];

export class siww {
    
    
    // instantiate the proper connector
    getConnector(_chain) {
        if(!_chain) {return null}
        _chain=_chain.toLowerCase();

        // get the chain or wallet connector
        switch(_chain) {
            case "cardano":
                return siwc;

            case "metamask":
                return siwm;
    
            default: 
                return null;
        }
    }

    _getConnectorFromWalletId(_id) {
        let ret=null;
        aConnector.forEach(connector => {
            if(connector.getWalletFromList(_id)!==null) {
                ret = connector;
            }
        });
        return ret;
    }

    
//
//      All connectors public APIs
//

    async_connectWallet(_id) {
        try {
            let _connector=this._getConnectorFromWalletId(_id);
            if(_connector) {
                return _connector.async_connectWallet(_id);
            }
            throw new Error()           
        }
        catch (err) {
            throw new Error("Could not find wallet connector for async_connectWallet");
        }
        
    }

    async_getConnectedWalletExtendedInfo(_id) {
        try {
            let _connector=this._getConnectorFromWalletId(_id);
            if(_connector) {
                return _connector.async_getConnectedWalletExtendedInfo(_id);
            }        
            throw new Error()           
        }
        catch (err) {
            throw new Error("Could not find wallet connector for async_getConnectedWalletExtendedInfo");
        }
    }

    async_createMessage(_id, objParam) {
        try {
            let _connector=this._getConnectorFromWalletId(_id);
            if(_connector) {
                return _connector.async_createMessage(_id, objParam);
            }        
            throw new Error()           
        }
        catch (err) {
            throw new Error("Could not find wallet connector for async_createMessage");
        }
    }

    async_signMessage(_id, objParam, strType) {
        try {
            let _connector=this._getConnectorFromWalletId(_id);
            if(_connector) {
                return _connector.async_signMessage(_id, objParam, strType);
            }
            throw new Error()           
        }
        catch (err) {
            throw new Error("Could not find wallet connector for async_signMessage");
        }        
    }

    getChainInfoFromSymbol(_id, _chain) {
        try {
            let _connector=this._getConnectorFromWalletId(_id);
            if(_connector) {
                return _connector.getChainInfoFromSymbol(_chain);
            }
            else {
                // bad luck, the connector has not listed all wallets yet... we take the first one that has this chain
                let objRet=null;
                aConnector.forEach(connector => {
                    let _objRet = connector.getChainInfoFromSymbol(_chain);
                    if(!objRet && _objRet) {objRet=_objRet}
                });
                return objRet
            }
        }
        catch (err) {
            throw new Error("Could not find wallet connector for getChainInfoFromSymbol");
        }        
    }
}

export default siww;