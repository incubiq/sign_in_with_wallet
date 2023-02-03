/*
 *      Sign-In With Phantom/Solana / wallet connect
 */

import {siww_connect} from "./siww_connect"

const CONNECTOR_SYMBOL = "SIWP"
const CONNECTOR_NAME = "Phantom"
const WALLET_NAME = "Phantom"

const KEPLR_SOLANA_NETWORK = "Solana"
const KEPLR_SOLANA_MAINNET = "Solana Mainnet"

let gaChain=[{
    connector: CONNECTOR_SYMBOL,
    name: "Solana",
    symbol: "SOL",
    id: "???",
    image : "symbol_solana.png"
}];

let isPhantomEnabled=true;        // oh that s bad... phantom does not know if it was enabled or not... so we have to think yes it was
const isPhantomInstalled = window.phantom?.solana?.isPhantom;
const getProvider = () => {
    if ('phantom' in window) {
      const provider = window.phantom?.solana;
      if (provider?.isPhantom) {
        return provider;
      }
    }
    return null;
  };

export class siwp_connect  extends siww_connect {

//
//      helpers
//

    createDefaultWallet(_idWallet) {
        let objDefault={
            chain: null,                       
            connector: CONNECTOR_SYMBOL,
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
            objDefault.chain=KEPLR_SOLANA_MAINNET;                 // by default we plug on this chain 
            objDefault.name=WALLET_NAME;                           // get name of wallet
            objDefault.logo="/assets/images/phantom.png";          // get get wallet logo ; sorry it s hardcoded
        }
        return this.getSanitizedWallet(objDefault);
    }

    getAcceptedChains() {
        return gaChain;
    }

    getConnectorSymbol() {
        return CONNECTOR_SYMBOL;
    }

    getConnectorMetadata (){
        return {
            symbol: CONNECTOR_SYMBOL,         // symbol
            connector_name: CONNECTOR_NAME,   // name of this connector
            wallet_name: CONNECTOR_NAME,      // target display name
            blockchain_name: KEPLR_SOLANA_MAINNET,  // blockchain name
            window: "phantom",                  // the window element to explore            
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
            if(isPhantomInstalled) {
                let objWallet = await this.async_getDefaultWalletInfo(WALLET_NAME);

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

            if(!isPhantomInstalled) {
                throw new Error("No Phantom installed");
            }
            
            const provider = getProvider();
            const resp = await provider.connect();
            _api={
            }// no api here... but compatibility...
        }
        catch(err) {
            console.log ("Wallet connection refused ")
        }

        return _api;
    }

    async async_isWalletEnabled(idWallet) {        
        let _isEnabled=isPhantomInstalled && isPhantomEnabled;
        return _isEnabled;
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

            let _networkId = "???";
            let _aChain=this.getAcceptedChains();
            let iChain=_aChain.findIndex(function (x) {return x.id===_networkId});
            _objWallet.networkId = _networkId;
            _objWallet.isOnProd=true;
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

    async _async_getFirstAddress() {
        try {
            return getProvider().publicKey.toString();
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

            const address = await this._async_getFirstAddress();
            if(address!==objSiwcMsg.address) {
                throw new Error("Public address does not match");
            }

            let msg=this.getMessageAsText(objSiwcMsg, type);
            let _hex= Buffer.from(msg).toString('hex');

            const provider = getProvider();            
            const encodedMessage = new TextEncoder().encode(msg);
            const _signed = await provider.signMessage(encodedMessage, "utf8");

            let COSESign1Message={
                buffer: _hex,
                key: _signed.publicKey,
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
            COSESign1Message.connector=CONNECTOR_SYMBOL;
            COSESign1Message.type=type;
            return COSESign1Message;
        }
        catch(err) {
            console.log (err.message);
            throw new Error(err.message);
        }
    }
}

export default siwp_connect;