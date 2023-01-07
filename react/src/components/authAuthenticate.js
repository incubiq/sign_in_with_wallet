import AuthConnect from "./authConnect";
import ViewHeader from "./viewHeader";
import ViewWallets from "./viewWallets";

import {WidgetMessage} from "../utils/widgetMessage";

import {CRITICALITY_LOW, CRITICALITY_NORMAL, CRITICALITY_SEVERE} from "../const/message";
import {srv_prepare} from "../services/authenticate";
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
            wallet_id: null,
            wallet_address: null,

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
                this.setState({hover: "searching for "+this.state.theme.name+" wallets browser plugins..."});    
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
        // update data with this selection
        if(_iSel!==-1 && _aIdentity.length>0) {
            if(_iSel!==this.state.iSelectedIdentity) {
                this.setState({iSelectedIdentity: _iSel});
                this.setState({username: _aIdentity[_iSel].username});
            }

            // UI notofication update
            this.setState({inTimerEffect: false})
            this.setState({hover:"You will share data taken from your <strong>"+_aIdentity[_iSel].wallet_id+"</strong> identity"});
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
    
                    // this identity myust be here in cache, or we will create...
                    if(getIdentityFromUsername(decoded.username)===null) {
                        createPartialIdentity({
                            connector: decoded.connector,
                            blockchain: decoded.blockchain,
                            wallet_address: decoded.wallet_address,
                            wallet_id: decoded.wallet_id
                        });    
                    }
    
                    // cookie contains new username (created by backend) => store it
                    updatePartialIdentity(decoded.wallet_id, decoded.connector, {
                        username: decoded.username,
                        wallet_address: decoded.wallet_address
                    });
    
                    // now we know who you are
                    that.setState({username: decoded.username});
                    that.setState({wallet_address: decoded.wallet_address});
                    that.setState({wallet_id: decoded.wallet_id});
    
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

    _prepareSIWC(objIdentityForAuth){
        // can we authenticate with SIWC??
        if(objIdentityForAuth) {
            this.setState({hover:"Using "+objIdentityForAuth.wallet_id+" wallet as the signing identity..."});

            // now pass details to server, so we get a cookie
            srv_prepare({
                connector: objIdentityForAuth.connector,
                blockchain: objIdentityForAuth.blockchain,
                wallet_id: objIdentityForAuth.wallet_id,
                wallet_addr: objIdentityForAuth.wallet_address,    
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
        super.onSIWCNotify_WalletsAccessible(_aWallet);
        if(this.state.iSelectedIdentity===null) {
            let msg="Zero wallet detected!"
            if(_aWallet.length===1) {
                msg="One wallet detected, checking connection..."
            }
            if(_aWallet.length>1) {
                msg= _aWallet.length+" wallets detected, please choose at least one to connect to."
            }
            this.setState({inTimerEffect: false})
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

            // make sure we have this user's identity in storage + update logo in case it changed
            if(getIdentityFromWallet(_wallet.id, _wallet.connector)===null) {
                createPartialIdentity({
                    connector: _wallet.connector,
                    blockchain: _wallet.chain,
                    wallet_address: _wallet.address,
                    wallet_id: _wallet.id,
                    wallet_logo: _wallet.logo
                });    
            }
            else {
                updatePartialIdentity(_wallet.id, _wallet.connector, {
                    wallet_logo: _wallet.logo
                });    
            }
    
            // did user just click to accept? we use this as Identity
            if(objParam.didUserClick) {
                if(objParam.didUserAccept) {
                    this._prepareSIWC({
                        wallet_address: _wallet.address,
                        wallet_id: _wallet.id,
                        blockchain: _wallet.chain,
                        connector: _wallet.connector
                    });        
                }
            }
            else {
                // use the first wallet to authenticate user with SIWC (only in case we do not have to confirm by user click)
                if(!mustConfirm) {
                    this.setConfirmLogin();     // do not come back with another one after 1st wallet call
                    this._prepareSIWC({
                        wallet_address: _wallet.address,
                        wallet_id: _wallet.id,
                        blockchain: _wallet.chain,
                        connector: _wallet.connector
                    });        
                }
            }    
//        }
    }

/*
 *          UI (authentication)
 */
    

    renderAuthentication( ){
        return(
            <div className={"siww-panel " + (this.state.theme.webapp.dark_mode ? "dark-mode": "")}>
                <div className="siww_message">

                    {this.state.didAccessWallets===false? 
                        <div>
                            <WidgetMessage 
                                headline = "One moment..."
                                text = "searching for wallets..."
                            />     
                        </div>
                    :
                        <div className="siww-oauth-datashare">
                            {this.props.webAppId?

                                this.state.aWallet && this.state.aWallet.length>0? 
                                    <>
                                        <div className="siww-section">
                                            <strong>Sign-in with {this.state.theme.name}</strong> has detected {this.state.aWallet.length===1? "one wallet:" : "those wallets:"} 
                                        </div>

                                        <ViewWallets 
                                            theme = {this.state.theme}
                                            aWallet= {this.state.aWallet}
                                            onSelect= {this.async_connectWallet.bind(this)}
                                            fnShowMessage={this.showMessage.bind(this)}                            
                                        />
                                    </>
                                :
                                    <WidgetMessage 
                                        error = {true}
                                        headline = "Could not detect a single wallet from this browser"
                                        text = {"You must use at least one "+this.state.theme.name+" wallet extension"}
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
            <div id="siww-login-container" style={this.props.styles.container}>
                <div className={"modal modal-login center-vh" + (this.state.theme.webapp.dark_mode ? "dark-mode": "")} style={this.props.styles.color}>

                    <ViewHeader 
                        app_id= {this.props.webAppId}
                        oauthClientName = {this.props.webAppName}
                        oauthDomain = {this.props.webAppDomain}
                        is_verified = {this.props.webApp.is_verified===true}
                        isOauth = {true}
                        SIWWLogo = {this.state.theme.logo}
                        theme = {this.state.theme}
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
