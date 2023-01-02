/*
 *      Sign-In With Wallet 
 */

import {replyFast, checkIsValidDomain, checkIsValidStatement, checkIsValidChain, checkIsValidDate, generateNonce}  from './siww_utils'

export class siww_connect {

//
//      helpers
//

    createDefaultWallet(_idWallet) {
        return {
            chain: null,
            connector: "SIWW",
            id: _idWallet,
            name: null,
            logo: null,
            isConnected: false,
            isOnProd: false,
            hasReplied: false,
            networkId: 0,
            address: null
        }
    }

    getSanitizedWallet(_objWallet) {
        return {
            connector: _objWallet.connector,
            chain: _objWallet.chain,
            networkId: _objWallet.networkId,
            id: _objWallet.id,
            name: _objWallet.name,
            isEnabled: _objWallet.isEnabled,
            isOnProd: _objWallet.isOnProd,
            hasReplied: _objWallet.hasReplied,
            logo: _objWallet.logo,
            address: _objWallet.address
        }        
    }

    getWalletFromList(_idWallet) {
        let i=this.aWallet.findIndex(function (x) {return x.id===_idWallet});
        return (i===-1? null : {
            index: i,
            wallet: this.aWallet[i]
        })
    }

    // must overwrite on implementation class
    getAcceptedChains() {
        return [];
    }

//
//      Initialization
//

    async async_initialize(objParam) {

        // various init params
        this.msKillFast = (objParam && objParam.msKillFast? objParam.msKillFast : 3000);
        this.msKillSlow = (objParam && objParam.msKillSlow? objParam.msKillSlow : 8000);

        // get all callbacks
        this.fnOnNotifyAccessibleWallets=objParam.onNotifyAccessibleWallets;
        this.fnOnNotifyConnectedWallet=objParam.onNotifyConnectedWallet;
        this.fnOnNotifySignedMessage=objParam.onNotifySignedMessage;

        // array of all accessible wallets
        this.aWallet=[];
        let that=this;
        try {
            // first call to get list of wallets (no calls to them)
            that.aWallet=await that.async_onListAccessibleWallets(false);

            // notify caller of all those available wallets we have detected
            if(this.fnOnNotifyAccessibleWallets) {
                this.fnOnNotifyAccessibleWallets(that.aWallet);
            }

            // notify caller of each connected wallet 
            that.aWallet.forEach(async function(item) {
                if(item.isEnabled) {
                    try {
                        let objRetConnected=await replyFast(that.msKillSlow, that.async_getConnectedWalletExtendedInfo.bind(that), item);
                        if(objRetConnected.isEnabled && objRetConnected.address && that.fnOnNotifyConnectedWallet) {
                            that.fnOnNotifyConnectedWallet({
                                didUserAccept: true,
                                didUserClick: false,
                                didShowWallet: true,
                                error: null,
                                wallet: that.getSanitizedWallet(objRetConnected)
                            });
                        }        
                    }
                    catch(error) { 
                        // we don t callback for this...
                        console.log(error);
                    }
                }
            });            
        }
        catch(err){
            throw err;
        }
    }

//
//      Generic APIs
//

    // get default wallet info (from browser)
    async async_getDefaultWalletInfo(_idWallet) {
        try {
            if(_idWallet) {

                let objWallet=this.createDefaultWallet(_idWallet);

                // enable?
                try {
                    let _isEnabled=await replyFast(this.msKillFast, this.async_isWalletEnabled.bind(this), _idWallet);
                    objWallet.isEnabled=_isEnabled;
                    objWallet.hasReplied=true;
                }
                catch(_err) {
                    objWallet.hasReplied=false;
                    // ok to fail... send basic info anyway
                }
                return this.getSanitizedWallet(objWallet);
            }
            else {
                throw new Error("Bad params");
            }
        }
        catch(err) {
            throw err;
        }
    }

    // request user to validate wallet connection
    async async_connectWallet(_idWallet) {
        let _obj=this.getWalletFromList(_idWallet);
        let _objWallet=this.createDefaultWallet(_idWallet);
        try{
            if (_obj && _obj.wallet) {                
                _objWallet=_obj.wallet;

                // ask to connect (wait for user to click on wallet OK )
                _objWallet.api = await this.async_enableWallet(_objWallet.id);
                if (_objWallet.api) {

                    // get connection details
                    let _obj=await this.async_getConnectedWalletExtendedInfo(_objWallet);
                    let objRet={
                        didUserAccept: true,
                        didUserClick: true,
                        didShowWallet: true,
                        error: null,
                        wallet: this.getSanitizedWallet(_obj)
                    }

                    if(this.fnOnNotifyConnectedWallet) {
                        this.fnOnNotifyConnectedWallet(objRet);
                    }
                    return objRet;
                } else {

                    _objWallet.isEnabled=false;
                    _objWallet.hasReplied=true;

                    let objRet2={
                        didUserAccept: false,
                        didUserClick: true,
                        didShowWallet: true,
                        error: "Wallet connection refused by user",
                        wallet: this.getSanitizedWallet(_objWallet)
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
            _objWallet.isEnabled=false;
            _objWallet.hasReplied=false;
            return {
                didUserAccept: false,
                didUserClick: false,
                didShowWallet: false,
                error : "Could not connect to wallet ("+_err+")",
                wallet: this.getSanitizedWallet(_objWallet)
            };
        }
    }        

//
//      All APIs to code (in implementation class)
//

    async async_onListAccessibleWallets() {
        return [];
    }

    async async_enableWallet(idWallet) {
        return null;
    }

    async async_isWalletEnabled(idWallet) {
        return false;
    }

    async async_getConnectedWalletExtendedInfo(_objWallet){
        return this._createDefaultWallet();
    }


//
//      Messages (still in progress)
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
        if(!checkIsValidChain(objParam.chain, this.getAcceptedChains())) {return false;}
        if(!checkIsValidDate(objParam.issued_at, objParam.valid_for)) {return false;}
        return true;
    }

    async async_createMessage(_idWallet, objParam){
        try{

            // are we connected with a wallet?
            let _obj=this.getWalletFromList(_idWallet);
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
                    api: _objWallet.api,
                    version: objParam.version? objParam.version: "1.0",
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
    async async_signMessage(_idWallet, objMsg, type){
        // implement at higher level
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
}

export default siww_connect;