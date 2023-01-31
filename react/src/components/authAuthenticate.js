import AuthConnect from "./authConnect";
import ViewHeader from "./viewHeader";
import ViewWallets from "./viewWallets";

import {WidgetMessage} from "../utils/widgetMessage";

import {CRITICALITY_LOW, CRITICALITY_NORMAL, CRITICALITY_SEVERE} from "../const/message";
import {srv_prepare, srv_getMe} from "../services/authenticate";
import {createPartialIdentity, updatePartialIdentity, getMyIdentities, getIdentityFromUsername, getIdentityFromWallet} from "../services/me";

import jsonwebtoken from "jsonwebtoken";

let didMount=false;
let mustConfirm=false;          // shall we wait for user confirmation?

class AuthAuthenticate extends AuthConnect {

/*
 *          inits
 */

    constructor(props) {
        super(props);    

        this.state= Object.assign({}, this.state, {

            // identity we will use for authentication
            token: null,
            username: null,

            // wallet info
            wallet_id: null,
            wallet_name: null,
            wallet_address: null,

            // which blockchain?           
            blockchain_symbol: null,
            blockchain_name: null,
            blockchain_image: null,
            blockchain_networkId: null,

            // connector used
            connector: null
        });                
    }

    setConfirmLogin() {
        mustConfirm=true;
    }

    hasConfirmLogin() {
        return mustConfirm
    }

    componentDidMount() {
        super.componentDidMount();

        // get the webApp info once
        if(!didMount) {
            didMount=true;
    
            // First UI loading effect
            if(!this.state.didAccessWallets) {
                this.setState({inTimerEffect: true})
                this.setState({hover: "searching for wallets browser plugins..."});    
            }
        }
    }

    componentDidUpdate(prevProps) {
        super.componentDidUpdate(prevProps);
        let didCall=false;

        // (i) we have a cookie;  and (ii) user was not yet authenticated ; and (at least one wallet is connected)  ; and (iv) confirmation not required
        // => we process this cookie for authentication
        let isOneConnected=false;
        this.state.aWallet.forEach(item => {
            if(item.hasConnected) {
                isOneConnected=true;
            }
        })
        if(this.props.AuthenticationCookieToken!==null && 
            this.state.iSelectedIdentity===null &&
            isOneConnected && 
            !mustConfirm) {
            didCall=true;
            this.async_onAuthCookieReceived(this.props.AuthenticationCookieToken);
        }

        // we have a NEW cookie 
        if(!didCall && this.props.AuthenticationCookieToken!==null && (prevProps.AuthenticationCookieToken===null || this.props.AuthenticationCookieToken!==prevProps.AuthenticationCookieToken)) {
            this.async_onAuthCookieReceived(this.props.AuthenticationCookieToken);
        }
    } 
    
/*
 *          Authentication
 */


    // we pass aIdentity to this fct coz setState is async and never wakes up in time...
    setSharedIdentity(_aIdentity, _iSel) {
        
        let setUser=function(_i){
            this.setState({iSelectedIdentity: _i});
            this.setState({username: _aIdentity[_i].username});
            this.setState({connector: _aIdentity[_i].connector});
            this.setState({blockchain_symbol: _aIdentity[_i].blockchain_symbol});
            this.setState({blockchain_name: _aIdentity[_i].blockchain_name});
            this.setState({blockchain_image: _aIdentity[_i].blockchain_image});
            this.setState({blockchain_networkId: _aIdentity[_i].blockchain_networkId});
            this.setState({wallet_id: _aIdentity[_i].wallet_id});
            this.setState({wallet_name: _aIdentity[_i].wallet_name});
            this.setState({wallet_address: _aIdentity[_i].wallet_address});
        }.bind(this);

        // update data with this selection
        if(_iSel!==-1 && _aIdentity.length>0) {
            if(_iSel!==this.state.iSelectedIdentity) {


                // do we have a username?? 
                if(!_aIdentity[_iSel].username) {
                    srv_getMe({
                        connector: _aIdentity[_iSel].connector,
                        wallet_id: _aIdentity[_iSel].wallet_id,
                        wallet_address: _aIdentity[_iSel].wallet_address
                    },  this.props.AuthenticationCookieToken)
                    .then(dataUser => {
                        // update user data
                        updatePartialIdentity(_aIdentity[_iSel].wallet_id, _aIdentity[_iSel].connector, {
                            username: dataUser.data.username,
                        });

                        _aIdentity[_iSel].username=dataUser.data.username;
                        setUser(_iSel);
                    })
                }
                else {
                    setUser(_iSel);
                }

            }

            // UI notification update
            this.setState({inTimerEffect: false})
            this.setState({hover:"You will share data taken from your <strong>"+_aIdentity[_iSel].wallet_id+"</strong> identity"});
            this.setState({criticality: CRITICALITY_NORMAL});
        }
    }

    // calling this will move the UI to the authorization section (next step)
    authenticateUser(aIdentity, iUser) {
        this.setConfirmLogin();
        this.setSharedIdentity(aIdentity, iUser);
    }

    // receiving a cookie from the backend => we are being authenticated into SIWW
    async async_onAuthCookieReceived(_token) {
        let that=this;
        let p=new Promise(function(resolve, reject) {
            jsonwebtoken.verify(_token, that.props.AuthenticationCookieSecret, function(err, decoded){
                if(err) {
                    console.log("Error decoding Cookie in REACT app");
                    resolve(false);
                }
                else {
                    // keep this token
                    that.setState({token: _token});

                    // get full blockchain info
                    let objChainInfo=that.getSIWW().getChainInfoFromSymbol(decoded.wallet_id, decoded.blockchain_symbol);

                    // this identity must be here in cache, or we will create...
                    if(getIdentityFromWallet(decoded.wallet_id, decoded.connector, decoded.blockchain_symbol)===null) {
                        createPartialIdentity({
                            connector: decoded.connector,
                            blockchain_symbol: decoded.blockchain_symbol,
                            blockchain_name: objChainInfo.name,
                            blockchain_image: objChainInfo.image,
                            blockchain_networkId: objChainInfo.networkId,
                            wallet_address: decoded.wallet_address,
                            wallet_id: decoded.wallet_id
                        });    
                    }
    
                    // cookie contains new username (created by backend) => store it
                    updatePartialIdentity(decoded.wallet_id, decoded.connector, {
                        username: decoded.username,
                        wallet_address: decoded.wallet_address,
                    });
    
                    // now we know who you are
                    that.setState({username: decoded.username});
                    that.setState({wallet_address: decoded.wallet_address});
                    that.setState({wallet_id: decoded.wallet_id});
                    that.setState({blockchain_symbol: decoded.blockchain_symbol});
                    that.setState({blockchain_name: objChainInfo.name});
                    that.setState({blockchain_image: objChainInfo.image});
                    that.setState({blockchain_networkId: objChainInfo.networkId});
                    that.setState({connector: decoded.connector});
    
                    // any new identity?
                    let aId=getMyIdentities();
                    that.setState({aIdentity: aId});

                    // check if our selected identity agreed to grant data
                    let i=aId.findIndex(function (x) {return x.username===decoded.username});
    
                    // we know this guy?
                    if(i===-1) {
                        console.log("Houston, we have a problem... unknown identity")
                        that.setState({hover:"Unknown identity! Try login again from your original application..."});
                        resolve(false);
                    }
    
                    // now need to pass grant authorization...
                    that.authenticateUser(aId, i);
                    resolve(true);
                }
            })
    
        });
        return p;
    }

/*
 *          Wallet interaction
 */

    _prepareSIWW(objIdentityForAuth){
        // can we authenticate with SIWW backend??
        if(objIdentityForAuth) {
            this.setState({hover:"Using "+objIdentityForAuth.wallet_id+" wallet as the signing identity..."});

            // now pass details to server, so we get a cookie
            srv_prepare({
                connector: objIdentityForAuth.connector,
                blockchain_symbol: objIdentityForAuth.blockchain_symbol,
                wallet_id: objIdentityForAuth.wallet_id,
                wallet_address: objIdentityForAuth.wallet_address,    
                app_id: this.props.webAppId
            })
                .then(dataObj => {
                    // ok??
                    if(!dataObj || !dataObj.data) {
                        let _err={
                            data: null,
                            status: dataObj.status,
                            statusText: dataObj.statusText
                        }
                        throw _err;
                    }
                    else {
                        this.props.onUpdateCookie(dataObj.data.cookie);
                    }

                }).catch(err =>{
                    // log/display an error 
                });    
        }
    }

    // called at init (what are those wallets?)
    onSIWCNotify_WalletsAccessible(_aWallet) {
        let _aCurrent=super.onSIWCNotify_WalletsAccessible(_aWallet);
        if(this.state.iSelectedIdentity===null) {
            let msg="Zero wallet detected!"
            if(_aCurrent.length===1) {
                msg="One wallet detected, checking connection..."
            }
            if(_aCurrent.length>1) {
                msg= _aCurrent.length+" wallets detected, please choose at least one to connect to."
            }
            this.setState({hover:msg});    
        }
    }
    
    onSIWCNotify_WalletConnected(objParam) {

        // process this call ONLY if we are in authentication view
//        if(this.state.iSelectedIdentity===null) {
            super.onSIWCNotify_WalletConnected(objParam);
            let _wallet = objParam && objParam.wallet? objParam.wallet : null;
    
            // accept debug only if on localhost
            if(!_wallet.isOnProd && this.props.isDebug!==true) {
                this.showMessage({
                    message: "Authentication failure - Make sure your wallet points to a PROD network!", 
                    criticality: CRITICALITY_SEVERE
                });   
                return;
            }

            // has the user accepted?
            if(!objParam.didUserAccept || _wallet.address===null) {
                this.showMessage({
                    message: "Wallet connection refused by user", 
                    criticality: CRITICALITY_SEVERE
                });   
                return;
            }

            // make sure we have a blockchain name.. if none, we take the network ID
            if(!_wallet.chain.name) {
                _wallet.chain.name="<network "+_wallet.chain.id+">";
                _wallet.chain.symbol="/assets/images/symbol_unknown.png";
            }
            
            // make sure we have this user's identity in storage + update logo in case it changed
            if(getIdentityFromWallet(_wallet.id, _wallet.connector, _wallet.chain.symbol)===null) {
                createPartialIdentity({
                    connector: _wallet.connector,
                    blockchain_name: _wallet.chain.name,
                    blockchain_symbol: _wallet.chain.symbol,
                    blockchain_image: _wallet.chain.image,
                    blockchain_networkId: _wallet.chain.id,
                    wallet_address: _wallet.address,
                    wallet_id: _wallet.id,
                    wallet_name: _wallet.name,
                    wallet_logo: _wallet.logo
                });    
            }
            else {
                updatePartialIdentity(_wallet.id, _wallet.connector, {
                    wallet_logo: _wallet.logo,
                    wallet_name: _wallet.name,
                    blockchain_name: _wallet.chain.name,
                    blockchain_symbol: _wallet.chain.symbol,
                    blockchain_image: _wallet.chain.image,
                    blockchain_networkId: _wallet.chain.id,
                });    
            }
    
            // did user just click to accept? we use this as Identity
            if(objParam.didUserClick) {
                if(objParam.didUserAccept) {
                    this._prepareSIWW({
                        wallet_address: _wallet.address,
                        wallet_id: _wallet.id,
                        blockchain_symbol: _wallet.chain.symbol,
                        connector: _wallet.connector
                    });        
                }
            }
            else {
                // use the first wallet to authenticate user with SIWW (only in case we do not have to confirm by user click)
                if(!mustConfirm) {
                    this.setConfirmLogin();     // do not come back with another one after 1st wallet call
                    this._prepareSIWW({
                        wallet_address: _wallet.address,
                        wallet_id: _wallet.id,
                        blockchain_symbol: _wallet.chain.symbol,
                        connector: _wallet.connector
                    });        
                }
            }    
//        }
    }

/*
 *          UI (authentication)
 */
    
    _getActiveConnectorsAsString() {
        let ret="Active connectors detected: "
        let _str="none";
        for (var i=0; i<this.state.aActiveConnector.length; i++) {
            if(i===0) {
                _str = "<b>"+this.state.aActiveConnector[0].assets.connector_name+"</b>"
            }
            else {
                _str= _str + ", <b>"+ this.state.aActiveConnector[i].assets.connector_name+"</b>"
            }
        }

        return (ret+_str);
    }

    renderAuthentication( ){
        return(
            <div className={"siww-panel " + (this.props.theme && this.props.theme.webapp.dark_mode ? "dark-mode": "")}>
                <div className="siww_message">

                    {this.state.didAccessWallets===false? 
                        <div>
                            <WidgetMessage 
                                headline = "One moment, initializing..."
                                text = {this._getActiveConnectorsAsString() + " <br /><br />Now searching for wallets..."}
                            />     
                        </div>
                    :
                        <div className="siww-oauth-datashare">
                            {this.props.webAppId?

                                this.state.aWallet && this.state.aWallet.length>0? 
                                    <>
                                        <div className="siww-section">
                                            Wallets detected from your browser:
                                        </div>

                                        <ViewWallets 
                                            theme = {this.props.theme}
                                            aWallet= {this.state.aWallet}
                                            onSelect= {this.async_connectWallet.bind(this)}
                                            fnShowMessage={this.showMessage.bind(this)}                            
                                        />

                                        <div className="hint">
                                            <br />
                                            Select wallet and allow connection to use identity
                                        </div>  
                                    </>
                                :
                                    <WidgetMessage 
                                        error = {true}
                                        headline = "Could not detect a single wallet from this browser"
                                        text = {this._getActiveConnectorsAsString()+". Check you browser's wallet extensions..."}
                                    />        
                            :
                                <>
                                    <WidgetMessage 
                                        error = {true}
                                        headline = "Could not identify caller!"
                                        text = "Please refresh or try Login again from the application."
                                    />        
                                </>
                            }
                        </div>
                    }
                </div>
            </div>                   
        )
    }

/*
 *          UI generic
 */
    showMessage(objMsg) { 
        this.setState({hover: objMsg.message});
        this.setState({criticality: objMsg.criticality? objMsg.criticality : CRITICALITY_LOW});
        this.setState({inTimerEffect: objMsg.hasTimerEffect===true});
    }

    callbackEffect () {
    }

    onHover(event, bOver) {
        // who's there?
        let idElt=event.currentTarget;
        let _id=idElt.getAttribute("attr-id");
        try {
            let msg=null;
            if(this.state.iSelectedIdentity!==null) {
                let i=this.state.aIdentity.findIndex(function (x) {return x.wallet_id===_id});
                if(i!==-1) {
                    if(bOver && i!==this.state.iSelectedIdentity) {
                        msg="Click to preview shared data from your <strong>"+this.state.aIdentity[i].wallet_id+"</strong> wallet's identity.";
                    }
                    else {
                        this.setSharedIdentity(this.state.aIdentity, this.state.iSelectedIdentity);
                    }
                }
            }
            else {
                let i=this.state.aWallet.findIndex(function (x) {return x.id===_id});
                if(i!==-1) {
                    if(bOver) {
                        msg=this.state.aWallet[i].isEnabled===true ? 
                            "Click to choose <strong>"+this.state.aWallet[i].id+"</strong> wallet as the signing identity."
                            : "Click to add <strong>"+this.state.aWallet[i].id+"</strong> wallet as a signing identity.";
                    }
                }    
            }

            if(msg) {
                this.showMessage({
                    message: msg
                })
            }
        }
        catch(err) {
        }
    }

    render() {
        return (
            <div id="siww-login-container" style={this.props.styles? this.props.styles.container: null}>
                <div className={"modal modal-login center-vh" + (this.props.theme && this.props.theme.webapp.dark_mode ? "dark-mode": "")} style={this.props.styles? this.props.styles.color: null}>

                    <ViewHeader 
                        app_id= {this.props.webAppId}
                        oauthClientName = {this.props.webAppName}
                        oauthDomain = {this.props.webAppDomain}
                        is_verified = {this.props.webApp.is_verified===true}
                        isOauth = {true}
                        theme = {this.props.theme}
                        wallet = {this.state.wallet_name}
                        aConnector = {this.state.aActiveConnector}
                        connector = {this.getActiveConnector()}
                    />

                    {this.state.iSelectedIdentity===null ? 
                            this.renderAuthentication()
                    :""}

                    {this.renderFooter()}
                </div>
        </div>
        )
    }
}

export default AuthAuthenticate;
