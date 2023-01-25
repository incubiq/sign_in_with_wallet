/*
 *      Sign-In With Keplr / wallet connect
 */

import {siww_connect} from "./siww_connect"

const CONNECTOR_NAME = "SIWK"
const KEPLR_ATOM_NETWORK = "keplr"
const KEPLR_ATOM_MAINNET = "Atom Mainnet"

// default chain that must/should be there
const chainIDs =  {
    "cosmoshub-4": {chain: KEPLR_ATOM_MAINNET, symbol:"ATOM"},
};      

let gaChain=[{
    connector: CONNECTOR_NAME,
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
        let objDefault={
            chain: null,                       
            connector: CONNECTOR_NAME,
            id: _idWallet,                                            // id of wallet
            api: null,
            apiVersion: null,
            name: null,
            logo: null,
            isEnabled: false,
            isOnProd: false,
            hasReplied: false,
            networkId: 0,
            address: null
        }
        if(window && window.keplr) {
            objDefault.chain=KEPLR_ATOM_MAINNET;                 // by default we plug on this chain 
            objDefault.name="Keplr";                             // get name of wallet
            objDefault.logo="/assets/images/keplr.png";          // get get wallet logo ; sorry it s hardcoded
        }
        return this.getSanitizedWallet(objDefault);
    }

    getAcceptedChains() {
        return gaChain;
    }

    registerChains(_aChain) {
        if(!_aChain) {return}
        for(var i=0; i<_aChain.length; i++) {
            let _isRegistered=gaChain.findIndex(function (x) {return x.id===_aChain[i].chainId});
            if(_isRegistered===-1) {
                gaChain.push({
                    connector: CONNECTOR_NAME,
                    name: _aChain[i].chainName,
                    symbol: (_aChain[i].currencies && _aChain[i].currencies.length>0? _aChain[i].currencies[0].coinDenom: null),
                    id: _aChain[i].chainId,
                    image : "/assets/images/symbol_unknown.png"
                })
            }
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
                getChainId: function(){
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

    async async_getConnectedWalletExtendedInfo(_id){
        let _objWallet=null;
        try {
            _objWallet=this.getWalletFromList(_id);
            if(!_objWallet)  {
                throw new Error("Could not find wallet "+_id);
            }

            _objWallet=_objWallet.wallet;
            if(!_objWallet.api && _objWallet.id!==null) {
                _objWallet.api = await this.async_enableWallet(_id);
            }

            if(!_objWallet.api) {
                throw new Error("Bad params");
            }

            let _networkId = _objWallet.api.getChainId();
            let _aChain=this.getAcceptedChains();
            let iChain=_aChain.findIndex(function (x) {return x.id===_networkId});
            _objWallet.networkId = _networkId;
            _objWallet.isOnProd=chainIDs[_networkId]!==null;
            _objWallet.address=await this._async_getFirstAddress(_networkId);
            _objWallet.chain= iChain>=0 ? _aChain[iChain] : this.getUnknownChainInfo(_networkId) ;
            _objWallet.isEnabled=true;
            return _objWallet;
        }
        catch(err) {
            _objWallet.isEnabled=false;
            return _objWallet;
        }
    }

//
//      Misc access to wallet public info
//

    async _async_getFirstAddress(_chainId) {
        try {
            // get the account
            const offlineSigner = window.keplr.getOfflineSigner(_chainId);
            const accounts = await offlineSigner.getAccounts();
            return (accounts && accounts.length>0 ? accounts[0].address : null);
        } catch (err) {
            console.log (err.message)
        }
        return null;
    }

    // Sign a message
    async async_signMessage(_idWallet, objSiwcMsg, type){
        try {
            // damn keplr cannot know if it s been enabled already... so we force it here in case it was not...
            this.async_enableWallet();

            let _chainId=this.getAcceptedChains()[0].id;    // getting the first chain listed 
            const address = await this._async_getFirstAddress(_chainId);

            if(address!==objSiwcMsg.address) {
                throw new Error("Public address does not match");
            }

            let msg=this.getMessageAsText(objSiwcMsg, type);
            let _hex= Buffer.from(msg).toString('hex');
            let _signed = await myKeplr.signArbitrary(_chainId, address, msg);
//            let _verif = await myKeplr.verifyArbitrary(_chainId, address, msg, _signed);      // we are not using this... validation is made on server

            let COSESign1Message={
                buffer: _hex,
                key: _signed.pub_key,
                signature: _signed.signature
            }
            // notify?
            if(this.fnOnNotifySignedMessage) {
                this.fnOnNotifySignedMessage(COSESign1Message);
            }

            // add info for server side validation
            COSESign1Message.valid_for=objSiwcMsg.valid_for;
            COSESign1Message.issued_at=objSiwcMsg.issued_at;
            COSESign1Message.address=address;
            COSESign1Message.chain=_idWallet;
            COSESign1Message.connector=CONNECTOR_NAME;
            COSESign1Message.type=type;
            return COSESign1Message;
        }
        catch(err) {
            console.log (err.message);
            throw new Error(err.message);
        }
    }
}

export default siwk_connect;