/*
 *      Sign-In With Phantom/Solana / wallet connect
 */

import {siww_connect} from "./siww_connect"

const CONNECTOR_SYMBOL = "SIWP"
const CONNECTOR_NAME = "Phantom"
const WALLET_NAME = "Phantom"

const SOLANA_NETWORK = "Solana"
const SOLANA_MAINNET = "Solana Mainnet"

let gaChain=[{
    connector: CONNECTOR_SYMBOL,
    name: "Solana",
    symbol: "SOL",
    id: "0x1",
    image : "symbol_solana.png"
}];

let isPhantomEnabled=true;        // oh that s bad... phantom does not know if it was enabled or not... so we have to think yes it was
let isPhantomInstalled = (window.phantom && window.phantom.solana && window.phantom.solana.isPhantom);
const getProvider = () => {
    if (isPhantomInstalled) {
      return window.phantom.solana;
    }
    return null;
  };

export class siwp_connect  extends siww_connect {

//
//      helpers
//

    createDefaultWallet(_idWallet) {
        let objDefault=super.createDefaultWallet(_idWallet);    
        if(isPhantomInstalled) {
            objDefault.chain=SOLANA_MAINNET;               // by default we plug on this chain 
            objDefault.name=WALLET_NAME;                           // get name of wallet
            objDefault.logo="/assets/images/phantom.png";          // get get wallet logo ; sorry it s hardcoded
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
            "0x1": {chain: SOLANA_MAINNET, symbol:"SOL"},
        }   
    }
    
    getConnectorMetadata (){
        return {
            symbol: CONNECTOR_SYMBOL,         // symbol
            connector_name: CONNECTOR_NAME,   // name of this connector
            wallet_name: CONNECTOR_NAME,      // target display name
            blockchain_name: SOLANA_MAINNET,  // blockchain name
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
            
            let _chainId=this.getAcceptedChains()[0].id;    // getting the first chain listed 
            const provider = getProvider();
            const resp = await provider.connect();
            _api={
                getNetworkId: function(){
                    return _chainId;
                }
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

//
//      Misc access to wallet public info
//

    async _async_getFirstAddress(_api) {
        try {
            return getProvider().publicKey.toString();
        } catch (err) {
            console.log (err.message)
        }
        return null;
    }
    
    // Sign a message via Phantom
    async async_signMessageOnly(objSiwcMsg, type, unused){
        try {
            // get signing address
            const usedAddress = await this._async_getFirstAddress(objSiwcMsg.api);
    
            // validate address and encode message
            let objRet=await super.async_signMessageOnly(objSiwcMsg, type, usedAddress);

            // sign via wallet
            const provider = getProvider();            
            const encodedMessage = new TextEncoder().encode(objRet.msg);
            const _signed = await provider.signMessage(encodedMessage, "utf8");
            objRet.key= _signed.publicKey.toBase58();
            objRet.signature= _signed.signature;
            return objRet;    
        }
        catch (err) {
            throw err;
        }
    }

}

export default siwp_connect;