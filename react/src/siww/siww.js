/*
 *      Sign-In With Wallet - Multi wallet Entry point
 */

import {siwc_connect} from "./siwc_connect"
import {siwm_connect} from "./siwm_connect"
import {siwk_connect} from "./siwk_connect"
import {siwp_connect} from "./siwp_connect"


const siwc=new siwc_connect();          // Cardano support (all wallets)
const siwm=new siwm_connect();          // Ethereum support (via Metamask)
const siwk=new siwk_connect();          // Cosmos support (via Keplr)
const siwp=new siwp_connect();          // Solana support (via Phantom)
let aConnector=[siwc, siwm, siwk, siwp];

export class siww {
    
    
    // instantiate the proper connector
    getConnector(_symbol) {
        if(!_symbol) {return null}

        // get the chain or wallet connector
        if(_symbol===siwc.getConnectorSymbol()) {return siwc}
        if(_symbol===siwm.getConnectorSymbol()) {return siwm}
        if(_symbol===siwk.getConnectorSymbol()) {return siwk}
        if(_symbol===siwp.getConnectorSymbol()) {return siwp}
        return null;
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

    
  getAllConnectorsWithMetadata() {

    const _fillMetadata = function(_ct, _objFill) {
        let _symbol=_ct.getConnectorSymbol();
        _objFill.aConnector.push(_symbol)
        _objFill[_symbol] = _ct.getConnectorMetadata() 
        _objFill[_symbol].aAcceptedBlockchain= [];
    }

    let objRet = {
        aConnector:  [],
    }
      
    _fillMetadata(siwc, objRet);        // add SIWC
    _fillMetadata(siwm, objRet);        // add SIWM
    _fillMetadata(siwk, objRet);        // add SIWK
    _fillMetadata(siwp, objRet);        // add SIWP

    return objRet;
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
            throw new Error("Please wait a few more seconds, wallet is still connecting...");
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
            throw new Error("Please wait a few more seconds, wallet is still connecting...");
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