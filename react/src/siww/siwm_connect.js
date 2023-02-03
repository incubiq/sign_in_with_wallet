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


export class siwm_connect  extends siww_connect {

//
//      helpers
//

    createDefaultWallet(_idWallet) {
        let objDefault=super.createDefaultWallet(_idWallet);    
        if(window && window.ethereum && window.ethereum.isMetaMask) {
            objDefault.chain=METAMASK_ETH_MAINNET;
            objDefault.name="Metamask";                 // get name of wallet
            objDefault.logo="/assets/images/metamask.png";                 // get get wallet logo ; sorry it s hardcoded
        }

        return this.getSanitizedWallet(objDefault);
    }

    getConnectorSymbol() {return CONNECTOR_SYMBOL}

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

    // we ONLY list PROD chains here
    getChainIDs() {
        return {
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
            _api={
                getNetworkId: function(){
                    return parseInt(window.ethereum.networkVersion);
                }
            }// no api here... but compatibility...
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
    
    // Sign a message via Metamask
    async async_signMessageOnly(objSiwcMsg, type, unused){
        try {
            // get signing address
            const usedAddresses = await web3.eth.getAccounts();
            const usedAddress = usedAddresses[0];
    
            // validate address and encode message
            let objRet=await super.async_signMessageOnly(objSiwcMsg, type, usedAddress);

            // sign via wallet
            let _signed = await web3.eth.personal.sign(objRet.msg, usedAddress);
            objRet.key=null;
            objRet.signature =_signed;
            return objRet;    
        }
        catch (err) {
            throw err;
        }
    }

}

export default siwm_connect;