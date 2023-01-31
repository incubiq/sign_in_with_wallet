/*
 *      Sign-In With Metamask / wallet connect
 */

import {siww_connect} from "./siww_connect"
import Web3 from 'web3';

const web3 = new Web3(Web3.givenProvider || window.location.origin);

const CONNECTOR_SYMBOL = "SIWM"
const CONNECTOR_NAME = "Metamask"

const METAMASK_ETH_NETWORK = "ethereum"
const METAMASK_ETH_MAINNET = "Ethereum Mainnet"
const METAMASK_BSC_MAINNET = "BSC Mainnet" 
const METAMASK_AVAX_MAINNET =  "Avalanche C-Chain"
const METAMASK_FTM_MAINNET =  "Fantom Opera"
const METAMASK_EVMOS_MAINNET =  "Evmos"

// we ONLY list PROD chains here
const chainIDs =  {
    "1": {chain: METAMASK_ETH_MAINNET, symbol:"ETH"},
    "56": {chain: METAMASK_BSC_MAINNET, symbol:"BNB"},
    "137": {chain: "Polygon Mainnet", symbol: "MATIC"},
    "42161": {chain: "Arbitrum One", symbol: "ETH"},
    "43114": {chain: "Avalanche C-Chain", symbol: "AVAX"},
    "10": {chain: "Optimism", symbol: "ETH"},
    "250": {chain: "Fantom Opera", symbol: "FTM"},
    "42220": {chain: "Celo Mainnet", symbol: "CELO"},
    "9001": {chain: "Evmos", symbol: "Evmos"},
    "2203": {chain: "Bitcoin EVM", symbol: "eBTC"}
};      // find more here : https://chainlist.org/  and this one : https://github.com/ethereum-lists/chains/tree/master/_data


export class siwm_connect  extends siww_connect {

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
        if(window && window.ethereum && window.ethereum.isMetaMask) {
            objDefault.name="Metamask";                 // get name of wallet
            objDefault.logo="/assets/images/metamask.png";                 // get get wallet logo ; sorry it s hardcoded
        }

        return this.getSanitizedWallet(objDefault);
    }

    getAcceptedChains() {
        return [{
            connector: CONNECTOR_SYMBOL,
            name: METAMASK_ETH_MAINNET,
            symbol: "ETH",
            id: 1,
            image : "symbol_ethereum.png"        // sorry, hardcoded
        }, {
            connector: CONNECTOR_SYMBOL,
            name: METAMASK_BSC_MAINNET,
            symbol: "BNB",
            id: 56,
            image : "symbol_binance.png"         // sorry, hardcoded
        }, {
            connector: CONNECTOR_SYMBOL,
            name: METAMASK_AVAX_MAINNET,
            symbol: "AVAX",
            id: 43114,
            image : "symbol_unknown.png"         // sorry, hardcoded
        }, {
            connector: CONNECTOR_SYMBOL,
            name: METAMASK_FTM_MAINNET,
            symbol: "FTM",
            id: 250,
            image : "symbol_unknown.png"         // sorry, hardcoded
        }, {
            connector: CONNECTOR_SYMBOL,
            name: METAMASK_EVMOS_MAINNET,
            symbol: "EVMOS",
            id: 9001,
            image : "symbol_unknown.png"         // sorry, hardcoded
        }];
    }

    getConnectorSymbol() {
        return CONNECTOR_SYMBOL;
    }

    getConnectorMetadata (){
        return {
            symbol: CONNECTOR_SYMBOL,         // symbol
            connector_name: CONNECTOR_NAME,   // name of this connector
            wallet_name: CONNECTOR_NAME,      // target display name
            blockchain_name: METAMASK_ETH_MAINNET,  // blockchain name
            window: "ethereum",                // the window element to explore      
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
            if(window && window.ethereum && window.ethereum.isMetaMask) {
                let objWallet = await this.async_getDefaultWalletInfo("Metamask");

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
            await web3.eth.requestAccounts();
            _api=function(){};  // no api here... but compatibility...
        }
        catch(err) {
            console.log ("Wallet connection refused ")
        }

        return _api;
    }

    async async_isWalletEnabled(idWallet) {
        let _isEnabled=false;
        try {
            if(window && window.ethereum && window.ethereum.isMetaMask)  {
                let _isMetamask=window.ethereum.isConnected();
                let _a=await window.ethereum.request({ method: 'eth_accounts' });
                _isEnabled=(_a !==false && _a.length>0);
            }
        } catch (err) {
            console.log ("Could not ask if wallet is enabled")
        }
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
                _objWallet.api = await this.async_enableWallet(_objWallet.id);
            }

            if(!_objWallet.api) {
                throw new Error("Bad params");
            }

            let _networkId = parseInt(window.ethereum.networkVersion);
            let _aChain=this.getAcceptedChains();
            let iChain=_aChain.findIndex(function (x) {return x.id===_networkId});
            _objWallet.networkId = _networkId;
            _objWallet.isOnProd=chainIDs[window.ethereum.networkVersion]!==null;
            _objWallet.address=await this._async_getFirstAddress(_objWallet.api);
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

    async _async_getFirstAddress(_api) {
        try {
            // get the account
            let aAccounts=await web3.eth.requestAccounts();
            if(aAccounts.length>0) {
                return aAccounts[0];
            }
            else {
                throw new Error("Could not access first address of wallet");
            }
        } catch (err) {
            console.log (err.message)
        }
        return null;
    }

    // Sign a message
    async async_signMessage(_idWallet, objSiwcMsg, type){
        try {
            const usedAddresses = await web3.eth.getAccounts();
            const usedAddress = usedAddresses[0];

            if(usedAddress!==objSiwcMsg.address) {
                throw new Error("Public address does not match");
            }

            let msg=this.getMessageAsText(objSiwcMsg, type);
            let _hex= Buffer.from(msg).toString('hex');
            let _signed = await web3.eth.personal.sign(msg, objSiwcMsg.address);
            let COSESign1Message={
                buffer: _hex,
                key: null,
                signature: _signed
            }
            // notify?
            if(this.fnOnNotifySignedMessage) {
                this.fnOnNotifySignedMessage(COSESign1Message);
            }

            // add info for server side validation
            COSESign1Message.valid_for=objSiwcMsg.valid_for;
            COSESign1Message.issued_at=objSiwcMsg.issued_at;
            COSESign1Message.address=usedAddress;
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

export default siwm_connect;