
/*
 *      known supported wallet
 *       - Nami
 * 
 *      check those...
 *       - Yoroi
 *       - Eternl
 *       - Flint
 *       - Gero

 *      Cardano API:
 *       - getNetworkId
 *       - getBalance
 *       - getUtxos
 *       - getUsedAddresses
 *       - getUnusedAddresses
 *       - getRewardAddresses
 *       - getChangeAddress
 *       - signData
 *       - signTx
 *       - submitTx
 *     see: https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030
 *     serializer: cardano-serialization-lib-browser obj
 */

import cbor from 'cbor'
import {
  Address,
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
  Value,
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
} from "@emurgo/cardano-serialization-lib-asmjs"

export class siwc_connect {

//
//      helpers
//

    _resetWallet() {
        return {
            chain: "Cardano",
            id: null,
            api: null,
            apiVersion: null,
            name: null,
            logo: null,
            isEnabled: false,
            hasReplied: false,
            networkId: 0,
            address: null    
        }
    }

    _getWalletFromList(_idWallet) {
        let i=this.aWallet.findIndex(function (x) {return x.id===_idWallet});
        return (i===-1? null : {
            index: i,
            wallet: this.aWallet[i]
        })
    }

    // to avoind being stuck in a request for an unresponsive wallet
    _replyFast = async (_waitTimeMs, fn, ...args) => {        
        let p=new Promise(function(resolve, reject) {
            setTimeout(function(){
                reject('timeout');
            },_waitTimeMs)

            fn(...args)
                .then(function(data){
                    resolve(data);
                })
                .catch(function(err){
                    reject(err);
                })                
        });
        return p;
    }

//
//      Initialization
//

    async async_initialize(objParam) {

        // various init params
        this.msKillFast = (objParam && objParam.msKillFast? objParam.msKillFast : 3000);
        this.msKillSlow = (objParam && objParam.msKillSlow? objParam.msKillSlow : 8000);

        // get all callbacks
        this.fnOnNotifyConnectedWallet=objParam.onNotifyConnectedWallet;
        this.fnOnNotifyAccessibleWallets=objParam.onNotifyAccessibleWallets;
        this.fnOnNotifySignedMessage=objParam.onNotifySignedMessage;

        // array of all accessible wallets
        this.aWallet=[];
        let that=this;
        try {
            that.aWallet=await that.async_onListAccessibleWallets();

            // notify caller of all wallets
            if(this.fnOnNotifyAccessibleWallets) {
                this.fnOnNotifyAccessibleWallets(that.aWallet);
            }
            
            that.aWallet.forEach(async function(item) {
                if(item.isEnabled && that.fnOnNotifyConnectedWallet) {
                    that.fnOnNotifyConnectedWallet({
                        wasConnected: true,
                        address: item.address
                    });
                }
            })
        }
        catch(err){
            throw err;
        }
    }

    async async_onListAccessibleWallets() {
        try {
            let _aWallet=[];
            if(window.cardano) {
                for (const key in window.cardano) {
                    if(window.cardano[key].hasOwnProperty("apiVersion")) {
                        let objWallet = await this.async_getDefaultWalletInfo(key);
                        if(objWallet.isEnabled) {

                            // push info with address?
                            try {
                                let objRetConnected=await this._replyFast(this.msKillSlow, this.async_getConnectedWalletInfo.bind(this), objWallet);
                                _aWallet.push(objRetConnected);    
                            }
                            catch(error) { 
                                objWallet.hasReplied=false;
                                _aWallet.push(objWallet);    
                            }
                        }
                        else {

                            // push infor for connection
                            _aWallet.push(objWallet);    
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

    async async_getDefaultWalletInfo(_idWallet) {
        try {
            let objWallet=this._resetWallet();
            if(_idWallet) {
                objWallet.id=_idWallet;                                              // id of wallet
                objWallet.apiVersion = window?.cardano?.[_idWallet].apiVersion;      // get API version of wallet
                objWallet.name = window?.cardano?.[_idWallet].name;                  // get name of wallet
                objWallet.logo = window?.cardano?.[_idWallet].icon;                  // get wallet logo

                // enable?
                try {
                    objWallet.isEnabled=await this._replyFast(this.msKillFast, this.async_isWalletEnabled.bind(this), _idWallet);
                    objWallet.hasReplied=true;
                }
                catch(_err) {
                    objWallet.hasReplied=false;
                    // ok to fail... send basic info anyway
                }
            }
            else {
                throw new Error("Bad params");
            }

            return objWallet;    
        }
        catch(err) {
            throw err;
        }
    }

    async async_getConnectedWalletInfo(_objWallet){
        try {
            if(!_objWallet.api && _objWallet.id!==null) {
                _objWallet.api = await this.async_enableWallet(_objWallet.id);
            }

            if(!_objWallet.api) {
                throw new Error("Bad params");
            }

            _objWallet.networkId = await _objWallet.api.getNetworkId();
            _objWallet.address=await this._async_getFirstAddress(_objWallet.api);
            _objWallet.chain= _objWallet.networkId === 0 ? "Cardano testnet" : "Cardano mainnet";
            _objWallet.isConnected=true;
            return _objWallet;
        }
        catch(err) {
            _objWallet.isConnected=false;
            _objWallet.alert=err.message?  err.message : err;
            return _objWallet;
        }
    }

    async async_connectWallet(_idWallet) {
        let _obj=this._getWalletFromList(_idWallet);
        let _objWallet=this._resetWallet();
        try{
            if (_obj && _obj.wallet) {                
                _objWallet=_obj.wallet;

                // ask to connect (wait for user to click on wallet OK )
                _objWallet.api = await this.async_enableWallet(_objWallet.id);
                if (_objWallet.api) {

                    // get connection details
                    let objRet=await this.async_getConnectedWalletInfo(_objWallet);

                    if(this.fnOnNotifyConnectedWallet) {
                        this.fnOnNotifyConnectedWallet({
                            wasConnected: true,
                            id: _idWallet,
                            address: objRet.address
                        });
                    }
                    return objRet;
                } else {

                    _objWallet.isConnected=false;
                    _objWallet.hasReplied=true;
                    _objWallet.alert= "Wallet connection refused by user";

                    if(this.fnOnNotifyConnectedWallet) {
                        this.fnOnNotifyConnectedWallet({
                            wasConnected: false,
                            id: _idWallet,
                            address: _objWallet.address
                        });
                    }
    
                    return _objWallet;
                }
            } else {
                throw new Error("expected a wallet id, got null");
            }
        } catch (err) {
            let _err=err.message? err.message : err;
            _objWallet.isConnected=false;
            _objWallet.hasReplied=false;
            _objWallet.alert= "Could not connect to wallet ("+_err+")";
            return _objWallet;
        }
    }        

    async async_createMessage(_idWallet, objParam){
        let _obj=this._getWalletFromList(_idWallet);
        try{
            if (_obj && _obj.wallet) {                

                // todo: for now we will return a basic object
                let objRet=this._formatMessage({
                    message: objParam.message? objParam.message : "TODO, some default message",
                    domain: objParam.domain? objParam.domain : null,                // who is calling?
                    address: _obj.wallet.address,
                    networkId: _obj.wallet.networkId,
                    name: _obj.wallet.name
                });

                return objRet;
            }
            else {
                throw new Error("expected a wallet id, got null");
            }
        } catch (err) {
            throw err;
        }
    }

    async async_signMessage(_idWallet, objSiwcMsg){
        let _obj=this._getWalletFromList(_idWallet);
        try{
            if (_obj && _obj.wallet) {                
                // need to ask the wallet to sign this msg 
                // TODO : missing this part right now
                // let s pretend we signed OK

                if(this.fnOnNotifySignedMessage) {
                    objSiwcMsg.wasSigned= true;
                    objSiwcMsg.id=_idWallet;
                    this.fnOnNotifySignedMessage(objSiwcMsg);
                }
            }
            else {
                    throw new Error("expected a wallet id, got null");
            }
        } catch (err) {
            throw err;
        }    
    }

    // format a message for showing in wallet
    _formatMessage(objMsg) {
        // todo... need implement this
        return objMsg;
    }

    async _async_getFirstAddress(_api) {
        try {
            const aRaw = await _api.getUsedAddresses();
            const _firstAddress = Address.from_bytes(Buffer.from(aRaw[0], "hex")).to_bech32()
            return _firstAddress
        } catch (err) {
            console.log ("Could not access first address of wallet")
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


}

export default siwc_connect;