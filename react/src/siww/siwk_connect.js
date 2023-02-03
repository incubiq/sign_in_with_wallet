/*
 *      Sign-In With Keplr / wallet connect
 */

import {siww_connect} from "./siww_connect"

const CONNECTOR_SYMBOL = "SIWK"
const CONNECTOR_NAME = "Keplr"

const KEPLR_ATOM_NETWORK = "keplr"
const KEPLR_ATOM_MAINNET = "Atom Mainnet"

let gaChain=[{
    connector: CONNECTOR_SYMBOL,
    name: "Cosmos Hub",
    symbol: "ATOM",
    id: "cosmoshub-4",
    image : "symbol_atom.png"
}];

let isKeplrEnabled=true;        // oh that s bad... keplr does not know if it was enabled or not... so we have to think yes it was
let myKeplr=null;

export class siwk_connect  extends siww_connect {

//
//      helpers
//

    createDefaultWallet(_idWallet) {
        let objDefault=super.createDefaultWallet(_idWallet);    
        if(window && window.keplr) {
            objDefault.chain=KEPLR_ATOM_MAINNET;                 // by default we plug on this chain 
            objDefault.name="Keplr";                             // get name of wallet
            objDefault.logo="/assets/images/keplr.png";          // get get wallet logo ; sorry it s hardcoded
        }
        return this.getSanitizedWallet(objDefault);
    }

    getConnectorSymbol() {return CONNECTOR_SYMBOL}

    getAcceptedChains() {
        return gaChain;
    }

    // default chain that must/should be there
    getChainIDs() {
        return {
            "cosmoshub-4": {chain: KEPLR_ATOM_MAINNET, symbol:"ATOM"},
        }   
    }

    registerChains(_aChain) {
        if(!_aChain) {return}
        for(var i=0; i<_aChain.length; i++) {
            let _isRegistered=gaChain.findIndex(function (x) {return x.id===_aChain[i].chainId});
            if(_isRegistered===-1) {
                gaChain.push({
                    connector: CONNECTOR_SYMBOL,
                    name: _aChain[i].chainName,
                    symbol: (_aChain[i].currencies && _aChain[i].currencies.length>0? _aChain[i].currencies[0].coinDenom: null),
                    id: _aChain[i].chainId,
                    image : "/assets/images/symbol_unknown.png"
                })
            }
        }
    }

    getConnectorMetadata (){
        return {
            symbol: CONNECTOR_SYMBOL,         // symbol
            connector_name: CONNECTOR_NAME,   // name of this connector
            wallet_name: CONNECTOR_NAME,      // target display name
            blockchain_name: KEPLR_ATOM_MAINNET,  // blockchain name
            window: "keplr",                  // the window element to explore            
        }
    }


//
//      Initialization
//

    async async_initialize(objParam) {
        await super.async_initialize(objParam);       
    }

    async async_onListAccessibleWallets() {
        try {
            let _aWallet=[];
            if(window && window.keplr) {
                let objWallet = await this.async_getDefaultWalletInfo("Keplr");

                // push info for connection
                _aWallet.push(this.getSanitizedWallet(objWallet));
            }
            return _aWallet;
        }
        catch(err) {
            throw err;
        }
    }
    
//
//      Connect with wallet
//

    async async_enableWallet(idWallet) {
        let _api=null;
        try {

            // todo for later... we can get the list of all chains on this wallet
//            let aChain = await window.keplr.getChainInfosWithoutEndpoints();
//            this.registerChains(aChain);

            // we set the keplr instance to use
            let _chainId=this.getAcceptedChains()[0].id;    // getting the first chain listed 
            let _temp= await window.keplr.getOfflineSigner(_chainId);
            if(_temp && _temp.keplr) {myKeplr=_temp.keplr} else {myKeplr=window.keplr}

            if(!myKeplr) {
                throw new Error("No Keplr installed");
            }
            
            await myKeplr.enable(_chainId);   
            _api={
                getNetworkId: function(){
                    return _chainId;
                }
            }// no api here... but compatibility...

            // we know it s enabled from this point
            isKeplrEnabled=true;
        }
        catch(err) {
            console.log ("Wallet connection refused ")
        }

        return _api;
    }

    async async_isWalletEnabled(idWallet) {        
        return (window.keplr && isKeplrEnabled);
    }


//
//      Misc access to wallet public info
//

    async _async_getFirstAddress(_api) {
        try {
            // get the account
            let _chainId=_api.getNetworkId();
            const offlineSigner = window.keplr.getOfflineSigner(_chainId);
            const accounts = await offlineSigner.getAccounts();
            return (accounts && accounts.length>0 ? accounts[0].address : null);
        } catch (err) {
            console.log (err.message)
        }
        return null;
    }

    // Sign a message via Keplr
    async async_signMessageOnly(objSiwcMsg, type, unused){
        try {
            // get signing address
            let _chainId=this.getAcceptedChains()[0].id;    // getting the first chain listed 
            const usedAddress = await this._async_getFirstAddress(objSiwcMsg.api);
    
            // validate address and encode message
            let objRet=await super.async_signMessageOnly(objSiwcMsg, type, usedAddress);

            // sign via wallet
            let _signed = await myKeplr.signArbitrary(_chainId, usedAddress, objRet.msg);
            objRet.key= _signed.pub_key
            objRet.signature= _signed.signature;
            return objRet;    
        }
        catch (err) {
            throw err;
        }
    }
    
}

export default siwk_connect;