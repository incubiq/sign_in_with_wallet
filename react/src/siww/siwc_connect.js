/*
 *      Sign-In With Cardano / wallet connect
 */

import {siww_connect} from "./siww_connect"

// import cbor from 'cbor'
import {
  Address,
  Value,
  /*
  BaseAddress,
  MultiAsset,
  Assets,
  ScriptHash,
  Costmdls,
  Language,
  CostModel,
  AssetName,
  TransactionUnspentOutput,
  TransactionUnspentOutputs,
  TransactionOutput,
  TransactionBuilder,
  TransactionBuilderConfigBuilder,
  TransactionOutputBuilder,
  LinearFee,
  BigNum,
  BigInt,
  TransactionHash,
  TransactionInputs,
  TransactionInput,
  TransactionWitnessSet,
  Transaction,
  PlutusData,
  PlutusScripts,
  PlutusScript,
  PlutusList,
  Redeemers,
  Redeemer,
  RedeemerTag,
  Ed25519KeyHashes,
  ConstrPlutusData,
  ExUnits,
  Int,
  NetworkInfo,
  EnterpriseAddress,
  TransactionOutputs,
  hash_transaction,
  hash_script_data,
  hash_plutus_data,
  ScriptDataHash, Ed25519KeyHash, NativeScript, StakeCredential
  */
} from "@emurgo/cardano-serialization-lib-asmjs";

const CONNECTOR_SYMBOL = "SIWC"

const CARDANO_NETWORK = "cardano"
const CARDANO_MAINNET = "Cardano Mainnet"

const DEPRECATED_WALLETS = ["ccvault"]          // ID of all wallets we are not going to accept

export class siwc_connect  extends siww_connect {

//
//      helpers
//

    createDefaultWallet(_idWallet) {
        let objDefault=super.createDefaultWallet(_idWallet);    
        if(window && window.cardano) {
            objDefault.chain=CARDANO_NETWORK;
            objDefault.apiVersion=window.cardano[_idWallet].apiVersion;     // get API version of wallet
            objDefault.name=window.cardano[_idWallet].name;                 // get name of wallet
            objDefault.logo=window.cardano[_idWallet].icon;                 // get get wallet logo
        }

        return this.getSanitizedWallet(objDefault);
    }

    getConnectorSymbol() {return CONNECTOR_SYMBOL}

    // we ONLY list PROD chains here
    getChainIDs() {
        return {
            "1": {chain: CARDANO_MAINNET, symbol:"ADA"},
        }
    }

    getAcceptedChains() {
        return [{
            connector: this.getConnectorSymbol(),
            name: CARDANO_MAINNET,
            symbol: "ADA",
            id: 1,
            image : "symbol_cardano.png"        // sorry, hardcoded
        }];
    }

    getConnectorMetadata (){
        return {
            symbol: CONNECTOR_SYMBOL,         // symbol
            connector_name: CARDANO_NETWORK,  // name of this connector
            wallet_name: "Cardano wallets",   // target display name
            blockchain_name: CARDANO_MAINNET, // blockchain name
            window: "cardano",                // the window element to explore
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
            if(window && window.cardano) {
                for (const key in window.cardano) {

                    // process if not deprecated
                    if(!DEPRECATED_WALLETS.includes(key)) {
                        if(window.cardano[key].hasOwnProperty("apiVersion")) {
                            let objWallet = await this.async_getDefaultWalletInfo(key);
                            
                            // push info for connection
                            _aWallet.push(this.getSanitizedWallet(objWallet));
                        }
    
                    }
                }
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
            _api = await window.cardano[idWallet].enable();
        }
        catch(err) {
            console.log ("Wallet connection refused ")
        }
        return _api;
    }

    async async_isWalletEnabled(idWallet) {
        let _isEnabled=false;
        try {
            _isEnabled=await window.cardano[idWallet].isEnabled();
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
            const aRaw = await _api.getUsedAddresses();
            if(aRaw && aRaw.length>0) {
                const _firstAddress = Address.from_bytes(Buffer.from(aRaw[0], "hex")).to_bech32()
                return _firstAddress    
            }
            else {
                throw new Error("Could not access first address of wallet");
            }
        } catch (err) {
            console.log (err.message)
        }
        return null;
    }

    async _async_getUnusedAddress(_api) {
        try {
            const aRaw = await _api.getUnusedAddresses();
            if(aRaw && aRaw.length>0) {
                const _firstAddress = Address.from_bytes(Buffer.from(aRaw[0], "hex")).to_bech32()
                return _firstAddress
            }
            else {
                throw new Error("Could not access any unused addresses of wallet");
            }
        } catch (err) {
            console.log (err.message)
        }
        return null;
    }

    // Sign a message on Cardano chain
    async async_signMessageOnly(objSiwcMsg, type, unused){
        try {
            // get signing address
            const usedAddresses = await objSiwcMsg.api.getUsedAddresses();
            const usedAddress = usedAddresses[0];

            // cardano specials, we swap signing address 
            objSiwcMsg.address=usedAddress;

            // validate address and encode message
            let objRet=await super.async_signMessageOnly(objSiwcMsg, type, usedAddress);

            // sign via wallet
            try{
                let _signed = await objSiwcMsg.api.signData(usedAddress, objRet.buffer);            
                objRet.key=_signed.key;
                objRet.signature = _signed.signature;    
                return objRet;    
            }
            catch(err) {
                throw new Error(err.info);
            }
        }
        catch (err) {
            throw err;
        }
    }

}

export default siwc_connect;