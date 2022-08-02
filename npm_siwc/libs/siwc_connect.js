
/*
 *      Sign-In With Cardano / wallet connect
 */

import {replyFast, checkIsValidDomain, checkIsValidStatement, checkIsValidChain, checkIsDateValid, generateNonce}  from './siwc_utils'

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
                if(item.isConnected && item.address && that.fnOnNotifyConnectedWallet) {
                    that.fnOnNotifyConnectedWallet({
                        wasConnected: true,
                        id: item.id,
                        chain: item.chain,
                        networkId: item.networkId,
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
                                let objRetConnected=await replyFast(this.msKillSlow, this.async_getConnectedWalletInfo.bind(this), objWallet);
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
                if(window && window.cardano) {
                    objWallet.apiVersion = window.cardano[_idWallet].apiVersion;      // get API version of wallet
                    objWallet.name = window.cardano[_idWallet].name;                  // get name of wallet
                    objWallet.logo = window.cardano[_idWallet].icon;                  // get wallet logo    
                }

                // enable?
                try {
                    objWallet.isEnabled=await replyFast(this.msKillFast, this.async_isWalletEnabled.bind(this), _idWallet);
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
                    let _obj=await this.async_getConnectedWalletInfo(_objWallet);
                    let objRet={
                        wasConnected: true,
                        id: _idWallet,
                        chain: _obj.chain,
                        networkId: _obj.networkId,    
                        address: _obj.address
                    }

                    if(this.fnOnNotifyConnectedWallet) {
                        this.fnOnNotifyConnectedWallet(objRet);
                    }
                    return objRet;
                } else {

                    _objWallet.isConnected=false;
                    _objWallet.hasReplied=true;
                    _objWallet.alert= "Wallet connection refused by user";

                    let objRet2={
                        wasConnected: true,
                        id: _idWallet,
                        chain: _objWallet.chain,
                        networkId: _objWallet.networkId,    
                        address: _objWallet.address
                }
                    if(this.fnOnNotifyConnectedWallet) {
                        this.fnOnNotifyConnectedWallet(objRet2);
                    }
    
                    return objRet2;
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

//
//      Messages
//

    // An input message must have all those params:
    //
    //  domain: string ; dns authority that is requesting the signing
    //  address: string ; address performing the signing 
    //  message: string ; message statement that the user will sign
    //  version: string ; version of the message
    //  chain: string ; chain that is being queried
    //  name: string ; name of wallet being queried
    //  issued_at: date ; when this message was issued
    //  valid_for: number ; how many seconds the message is valid (after issued_at)
    //  nonce: number ; randomized number used to prevent replay attacks
    //
    isMessageInputValid(objParam){
        if(!checkIsValidDomain(objParam.domain)) {return false;}
        if(!objParam.address) {return false;}
        if(!checkIsValidStatement(objParam.message)) {return false;}
        if(!checkIsValidChain(objParam.chain)) {return false;}
        if(!checkIsDateValid(objParam.issued_at, objParam.valid_for)) {return false;}
        return true;
    }

    async async_createMessage(_idWallet, objParam){
        try{

            // are we connected with a wallet?
            let _obj=this._getWalletFromList(_idWallet);
            if (_obj && _obj.wallet) {                
                let _objWallet=_obj.wallet;

                // who is caling?
                let _host=window.location.hostname;
                if(window.location.port!=="") {
                    _host=_host+":"+window.location.port;
                }

                let now = new Date(); 
                let nowUtc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
        
                // full object filled with wallet info
                let objMsg={
                    message: objParam.message? objParam.message: null,
                    domain: _host,
                    issued_at: nowUtc,
                    valid_for: objParam.valid_for? objParam.valid_for : null,
                    address: _objWallet.address,
                    chain: _objWallet.chain,
                    name: _objWallet.name,
                    version: "1.0",
                    nonce: generateNonce()
                }
                
                if(!this.isMessageInputValid(objMsg)) {
                    throw new Error("missing or incorrect params");
                }
                    
                // message is OK to go
                return objMsg;
            }
            else {
                throw new Error("expected a wallet id, got null");
            }
        } catch (err) {
            throw err;
        }
    }

    // type of signing:
    //  "authentication" : for authenticating user
    //  "revocation" : for revocating consent of data shared by user with domain
    //
    async async_signMessage(_idWallet, objSiwcMsg, type){
        let _obj=this._getWalletFromList(_idWallet);
        try{
            if (_obj && _obj.wallet) {                
                // need to ask the wallet to sign  this msg 

                // TODO : missing this part right now (CIP008), so we will fake it via a dialog
                function getConfirmation() {
                    var retVal = window.confirm(_str);
                    if( retVal == true ) {
                       return true;
                    } else {
                       return false;
                    }
                }

                let _str=this._formatMessage(objSiwcMsg);
                let isSigned=getConfirmation(_str);

                // let's assume the wallet signed the message
                let objRet={
                    wasSigned: isSigned,
                    type: type,
                    id:_idWallet,
                    msg: objSiwcMsg
                }
                if(this.fnOnNotifySignedMessage) {
                    this.fnOnNotifySignedMessage(objRet);
                }
                return objRet;
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
        let _strValidFor=null;
        if(objMsg.valid_for<60) {_strValidFor=objMsg.valid_for+" seconds"} else {
            if(objMsg.valid_for<3600) {_strValidFor=Math.floor(objMsg.valid_for/60)+" minutes"} else {
                _strValidFor=Math.floor(objMsg.valid_for/3600)+" hours"
            }
        }
        let _str=objMsg.message + "\n\nissued at "+objMsg.issued_at.toString()+" and valid for "+_strValidFor;
        return _str;
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
                throw {};
            }
        } catch (err) {
            console.log ("Could not access first address of wallet")
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
                throw {};
            }
        } catch (err) {
            console.log ("Could not access any unused addresses of wallet")
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