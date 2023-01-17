/*
 *      Sign-In With Wallet - Multi wallet Entry point
 */

import {siwc_connect} from "./siwc_connect"
import {siwm_connect} from "./siwm_connect"

let aConnector=[];

export class siww {
    
    // instantiate the proper connector
    getConnector(_chain) {
        if(!_chain) {return null}
        _chain=_chain.toLowerCase();

        // get the chain or wallet connector
        switch(_chain) {
            case "cardano":
                this.siwc=new siwc_connect();
                aConnector.push(this.siwc);
                return this.siwc;

            case "metamask":
                this.siwm=new siwm_connect();
                aConnector.push(this.siwm);
                return this.siwm;
    
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
        let _connector=this._getConnectorFromWalletId(_id);
        if(_connector) {
            return _connector.async_connectWallet(_id);
        }        
        throw new Error("Could not find wallet connector for async_connectWallet");
    }

    async_getConnectedWalletExtendedInfo(_id) {
        let _connector=this._getConnectorFromWalletId(_id);
        if(_connector) {
            return _connector.async_getConnectedWalletExtendedInfo(_id);
        }        
        throw new Error("Could not find wallet connector for async_getConnectedWalletExtendedInfo");
    }

    async_createMessage(_id, objParam) {
        let _connector=this._getConnectorFromWalletId(_id);
        if(_connector) {
            return _connector.async_createMessage(_id, objParam);
        }        
        throw new Error("Could not find wallet connector for async_createMessage");
    }

    async_signMessage(_id, objParam, strType) {
        let _connector=this._getConnectorFromWalletId(_id);
        if(_connector) {
            return _connector.async_signMessage(_id, objParam, strType);
        }        
        throw new Error("Could not find wallet connector for async_signMessage");
    }

}

export default siww;