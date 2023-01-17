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

const CONNECTOR_NAME = "SIWC"

const CARDANO_NETWORK = "cardano"
const CARDANO_MAINNET = "Cardano mainnet"
const CARDANO_TESTNET = "Cardano testnet"

export class siwc_connect  extends siww_connect {

//
//      helpers
//

    createDefaultWallet(_idWallet) {
        let objDefault={
            chain: CARDANO_NETWORK,
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
        if(window && window.cardano) {
            objDefault.apiVersion=window.cardano[_idWallet].apiVersion;     // get API version of wallet
            objDefault.name=window.cardano[_idWallet].name;                 // get name of wallet
            objDefault.logo=window.cardano[_idWallet].icon;                 // get get wallet logo
        }

        return objDefault
    }

    getAcceptedChains() {
        return [CARDANO_MAINNET, CARDANO_TESTNET, CARDANO_NETWORK];
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
                    if(window.cardano[key].hasOwnProperty("apiVersion")) {
                        let objWallet = await this.async_getDefaultWalletInfo(key);

                        // push info for connection
                        _aWallet.push(this.getSanitizedWallet(objWallet));
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

    async async_getConnectedWalletExtendedInfo(_objWallet){
        try {
            if(!_objWallet.api && _objWallet.id!==null) {
                _objWallet.api = await this.async_enableWallet(_objWallet.id);
            }

            if(!_objWallet.api) {
                throw new Error("Bad params");
            }

            _objWallet.networkId = await _objWallet.api.getNetworkId();
            _objWallet.isOnProd=_objWallet.networkId===1;
            _objWallet.address=await this._async_getFirstAddress(_objWallet.api);
            _objWallet.chain= CARDANO_NETWORK;
            _objWallet.balance = await this._async_getBalance(_objWallet.api);
            _objWallet.utxos=await this._async_getUtxo(_objWallet.api)
            _objWallet.isEnabled=true;
            return _objWallet;
        }
        catch(err) {
            _objWallet.isEnabled=false;
            return _objWallet;
        }
    }

    async async_getConnectedWalletBalance(_objWallet){
        try {
            if(!_objWallet.api && _objWallet.id!==null) {
                _objWallet.api = await this.async_enableWallet(_objWallet.id);
            }

            if(!_objWallet.api) {
                throw new Error("Bad params");
            }

            let balance = await this._async_getBalance(_objWallet.api);
            return balance;
        }
        catch(err) {
            return null;
        }
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

    async _async_getUtxo(_api) {
        try {
            let aUnspent = await _api.getUtxos();
            return aUnspent;
        } catch (err) {
            console.log ("Could not get UTxO");
        }
        return null;
    }

    async _async_getBalance(_api) {
        try {
            let cborBal = await _api.getBalance();
//          let amount=cbor.decodeFirstSync(cborBal);  // other alternative to decode the cbor
            let amount=Value.from_bytes(Buffer.from(cborBal, "hex")).coin();        
            return amount;
        } catch (err) {
            console.log ("Could not get Balance");
        }
        return null;        
    }

    // Sign a message
    async async_signMessage(_idWallet, objSiwcMsg, type){
        try {
            let COSESign1Message=null;
            const usedAddresses = await objSiwcMsg.api.getUsedAddresses();
            const usedAddress = usedAddresses[0];

            let aMsg=[];
            aMsg.push( objSiwcMsg.message);
            aMsg.push( " -- Secure message by Sign With Wallet --");
            aMsg.push( "Purpose: "+ type);
            aMsg.push( "Issued At: "+ objSiwcMsg.issued_at);
            aMsg.push( "Valid for: "+ objSiwcMsg.valid_for/60 + " minutes");
            aMsg.push( "SIWW Version: "+ objSiwcMsg.version);
            let msg=aMsg.join("\r\n");
            let _hex= Buffer.from(msg).toString('hex');
            COSESign1Message = await objSiwcMsg.api.signData(usedAddress, _hex);

            // notify?
            if(this.fnOnNotifySignedMessage) {
                this.fnOnNotifySignedMessage(COSESign1Message);
            }

            // add info for server side validation
            COSESign1Message.valid_for=objSiwcMsg.valid_for;
            COSESign1Message.issued_at=objSiwcMsg.issued_at;
            COSESign1Message.address=usedAddress;
            COSESign1Message.connector=CONNECTOR_NAME;
            COSESign1Message.type=type;
            return COSESign1Message;

        }
        catch(err) {
            console.log (err.info);
            throw new Error(err.info);
        }
    }
}

export default siwc_connect;