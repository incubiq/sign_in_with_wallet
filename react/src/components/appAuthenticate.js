import AppConnect from "./appConnect";
import ViewHeader from "./viewHeader";
import ViewFooter from "./viewFooter";
import ViewDataShare from "./viewDataShare";
import ViewIdentities from "./viewIdentities";
import ViewWallets from "./viewWallets";
import ViewProgressBar from "./viewProgressBar";
import FormAuthenticate from "./formAuthenticate";

import {srv_prepare, srv_getDomainInfo} from "../services/authenticate";
import {registerWebAppWithIdentity, createPartialIdentity, updatePartialIdentity, getMyIdentities} from "../services/me";

import jsonwebtoken from "jsonwebtoken";

let didMount=false;
const VIEWMODE_IDENTITY="identity";
const VIEWMODE_DATASHARE="datashare";
const VIEWMODE_REDIRECT="redirect";

class AppAuthenticate extends AppConnect {

/*
 *          inits
 */

    constructor(props) {
        super(props);    

        // params?
        let _client_id=decodeURIComponent(decodeURIComponent(this.getmyuri("client_id", window.location.search)));

        // todo : remove this soon....
        let _confirm=decodeURIComponent(decodeURIComponent(this.getmyuri("confirm", window.location.search)));
        
        this.state= Object.assign({}, this.state, {

            // webApp requesting authentication/authorization
            client_id: _client_id? _client_id : null,
            oauthClientName: "???",
            oauthDomain: "unknown",
            logoWebApp: "",
            theme: this.props.theme,
            redirect_url: null,

            //UX/UI
            mustConfirm: (_confirm==="true"),       // shall we wait for user confirmation?
            hover: "One moment! checking "+this.props.theme.name+" wallet browser plugins...",                              // indicate anything to user in footer

            // identity we will use for authentication
            cookie: null,
            username: null,
            wallet_id: null,
            wallet_address: null,

            // for authorization
            isAuthenticated: false,
            isAuthorized: false,
            aScope: [],
            aIdentity: [],
            iSelectedIdentity: null,
            viewMode: VIEWMODE_DATASHARE
        });        
    }

    componentDidMount() {
        super.componentDidMount();

        // get the webApp info once
        if(!didMount) {
            didMount=true;
            this.async_initializeDomain(this.state.client_id);
        }
    }

    // get all necessary info from connecting webapp
    async async_initializeDomain(_client_id) {
        let dataDomain=await srv_getDomainInfo(_client_id);
        if(dataDomain && dataDomain.data) {
            this.setState({oauthClientName: dataDomain.data.display_name});
            this.setState({oauthDomain: dataDomain.data.domain_name});
            this.setState({redirect_url: dataDomain.data.redirect_uri});
        }

        // get the scope...
        if(dataDomain && dataDomain.data && dataDomain.data.aScope) {
            let aId=getMyIdentities();
        
            // make sure WebApp is registered for each known identity of this user...
            aId.forEach(item=> {
                registerWebAppWithIdentity(item.username, {
                    client_id: _client_id,
                    scope: dataDomain.data.aScope
                });    
            });
    
            this.setState({aScope: dataDomain.data.aScope});
            this.setState({aIdentity: aId});    
        }
    }
    
/*
 *          Authentication
 */

    // calling this will move the UI to the authorization section (next step)
    authenticateUser(iUser) {
        this.setState({isAuthenticated: true});
        this.setState({mustConfirm: true});
        this.setSharedIdentity(iUser);
        this.setState({viewMode: VIEWMODE_DATASHARE});
    }

    // receiving a cookie from the backend => we are being authenticated into SIWW
    async async_onAuthCookieReceived(cookie) {
        let _client_id=this.state.client_id;
        let that=this;
        jsonwebtoken.verify(cookie.token, this.state.cookieSecret, function(err, decoded){
            if(err) {
                console.log("Error decoding Cookie in REACT app");
                return false;
            }
            else {
                // cookie contains new username (created by backend) => store it
                updatePartialIdentity(decoded.wallet_address, {
                    username: decoded.username
                });

                // now we know who you are
                that.setState({username: decoded.username});
                that.setState({wallet_address: decoded.wallet_address});
                that.setState({wallet_id: decoded.wallet_id});
                that.setState({cookie: cookie});

                // any new identity?
                let aId=getMyIdentities();
                that.setState({aIdentity: aId});

                // check if our selected identity agreed to grant data
                let i=aId.findIndex(function (x) {return x.username===decoded.username});

                // we have granted?
                if(i===-1) {
                    console.log("Houston, we have a problem... unknown identity")
                    return false
                }

                let j=-1; 
                let aWebApp=aId[i].aWebApp;
                if(aWebApp && aWebApp.length>0) {
                    j=aWebApp.findIndex(x => {
                        return x.client_id===_client_id
                    });
                }

                // never asked for granting?  need to grant authorization first...
                if(j===-1 || aWebApp[j].didGrant!==true) {
                    that.authenticateUser(i);
                }
                else {
                    // now we know who your data
                    that.authorizeUser();
                }

                return true;
            }
        })
    }

/*
 *          Authorization
 */

    // calling this will move the UI to the redirection section (final step)
    authorizeUser() {
        this.setState({isAuthorized: true});
    }

    setSharedIdentity(_iSel) {
        // update data with this selection
        if(_iSel!==-1 && this.state.aIdentity.length>0) {
            if(_iSel!==this.state.iSelectedIdentity) {
                this.setState({iSelectedIdentity: _iSel});
                let _aScope=this.state.aScope.slice();
                _aScope.forEach(item => {
                    let _value=this.state.aIdentity[this.state.iSelectedIdentity][item.property]
                    item.value=_value;
                });

                this.setState({aScope: _aScope});
            }
            this.setState({hover:"You will share data taken from your <strong>"+this.state.aIdentity[_iSel].wallet_id+"</strong> identity"});
        }
    }

/*
 *          Wallet interaction
 */

    _prepareSIWC(objIdentityForAuth){
        // can we authenticate with SIWC??
        if(objIdentityForAuth) {
            this.setState({hover:"Using "+objIdentityForAuth.wallet_id+" wallet as the signing identity..."});

            // get soket... hopefully it s here!
            let _socket=this.props.getSocket();
            if(!_socket || !_socket.id) {
                console.log("Socket not initialized");
                return;
            }

            // now pass details to server, so we get a cookie
            srv_prepare({
                provider: objIdentityForAuth.provider,
                wallet_id: objIdentityForAuth.wallet_id,
                wallet_addr: objIdentityForAuth.wallet_address,    
                socket_id: _socket.id,
                client_id: this.state.client_id
            })
                .then(res => {
                    // ok??
                    if(!res.ok) {
                        let _err={
                            data: null,
                            status: res.status,
                            statusText: res.statusText
                        }
                        throw _err;
                    }
                    else {
                        // visual effect (wait for cookie)
        
                        // we wait to be called back on sockets...
                    }

                }).catch(err =>{
                    // log/display an error 
                });    
        }
    }

    // called at init (what are those wallets?)
    onSIWCNotify_WalletsAccessible(_aWallet) {
        super.onSIWCNotify_WalletsAccessible(_aWallet);

        let msg="Zero wallet detected!"
        if(_aWallet.length===1) {
            msg="One wallet detected, checking connection..."
        }
        if(_aWallet.length>1) {
            msg= _aWallet.length+" wallets detected, please choose at least one to connect to."
        }
        this.setState({hover:msg});
    }
    
    onSIWCNotify_WalletConnected(objParam) {

        // process this call ONLY if we are in authentication view
        if(!this.state.isAuthenticated) {
            super.onSIWCNotify_WalletConnected(objParam);
            let _wallet = objParam && objParam.wallet? objParam.wallet : null;
    
            // make sure we have this user's identity in storage
            createPartialIdentity({
                wallet_address: _wallet.address,
                wallet_id: _wallet.id,
                wallet_logo: _wallet.logo
            });
    
            // did user just click to accept? we use this as Identity
            if(objParam.didUserClick) {
                if(objParam.didUserAccept) {
                    this._prepareSIWC({
                        wallet_address: _wallet.address,
                        wallet_id: _wallet.id,
                        provider: _wallet.provider
                    });        
                }
            }
            else {
                // use the first wallet to authenticate user with SIWC (only in case we do not have to confirm by user click)
                if(!this.state.mustConfirm) {
                    this._prepareSIWC({
                        wallet_address: _wallet.address,
                        wallet_id: _wallet.id,
                        provider: _wallet.provider
                    });        
                }
            }    
        }
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
                            <div id="idTransitoryMessage" className="transitoryMessage">
                                Please wait<br /> searching for {this.state.theme.name} wallets...
                            </div>
                            <ViewProgressBar
                                theme = {this.state.theme}
                                id = "myLoginProgressBar"
                                idMessage = "idTransitoryMessage"
                            />                            
                        </div>
                    :
                        <>
                            {this.state.client_id?
                                <ViewWallets 
                                    theme = {this.state.theme}
                                    aWallet= {this.state.aWallet}
                                    onSelect= {this.async_connectWallet.bind(this)}
                                    onHover= {this.onHover.bind(this)}                            
                                />
                            :
                                <>
                                    <div className="transitoryMessage">
                                        Could not identify caller!
                                        <br />
                                        Please try <b>Login</b> again from the application.
                                    </div>
                                </>
                            }
                        </>
                    }
                </div>
            </div>                   
        )
    }

/*
 *          UI (authorization)
 */
    
    onChangeIdentity(event) {
        // who's there?
        let idElt=event.currentTarget;
        let _id=idElt.getAttribute("attr-id");

        // css 
        let aEltId=document.getElementsByClassName("wallet-sign");
        for(var i=0; i<aEltId.length; i++) {
            aEltId[i].className ="wallet-sign connected";
        }
        idElt.className="wallet-sign connected selected";

        let _iSel=this.state.aIdentity.findIndex(function (x) {return x.wallet_id===_id});
        this.setSharedIdentity(_iSel);
        this.onToggleAuthorizationView();
    }

    onBackToAddIdentity() {
        this.setState({isAuthenticated: false});
    }

    onToggleAuthorizationView() {
        if(this.state.viewMode===VIEWMODE_DATASHARE) {
            this.setState({viewMode: VIEWMODE_IDENTITY});
        }
        else {
            this.setState({viewMode: VIEWMODE_DATASHARE});
        }
    }

    onReAuthenticate ( ){
        // todo
        this.props.onRedirect("/app/authenticate?client_id=" + this.state.client_id);
    }
    
    renderAuthorization() {
        return(
            <>
            {this.state.aScope.length>0? 
                <>
                {this.state.aIdentity.length>0?
                    <div className={"siww-panel " + (this.state.theme.webapp.dark_mode ? "dark-mode": "")}>

                        {this.state.viewMode===VIEWMODE_DATASHARE? 
                            <ViewDataShare 
                                theme = {this.state.theme}
                                oauthClientName = {this.state.oauthClientName}
                                iSelectedIdentity = {this.state.iSelectedIdentity}
                                aIdentity = {this.state.aIdentity}
                                aScope = {this.state.aScope}
                            />
                        : 
                            <ViewIdentities 
                                theme = {this.state.theme}
                                iSelectedIdentity = {this.state.iSelectedIdentity}
                                aIdentity = {this.state.aIdentity}
                                onHover = {this.onHover.bind(this)}
                                onSelect= {this.onChangeIdentity.bind(this)}
                            />
                        }

                        <div className="identity_action">

                            {this.state.viewMode===VIEWMODE_DATASHARE && this.state.aIdentity.length>1 ? 
                                <div 
                                    className="btn btn-transparent actionLink back"
                                    onClick={evt => {this.onToggleAuthorizationView();}}
                                >
                                    Switch Identity!
                                </div>                            
                            : 
                                <div 
                                    className="btn btn-transparent actionLink back"
                                    onClick={evt => {this.onBackToAddIdentity(evt);}}
                                >
                                    Back to wallets!
                                </div>
                            }   

                            <button 
                                className="btn btn-quiet"
                                onClick={evt => {
                                    this.authorizeUser();
                                }}
                            >
                                Grant Access!
                            </button>
                        </div>
                    </div>                
                : 
                <div className={"siww-panel " + (this.state.theme.webapp.dark_mode ? "dark-mode": "")}>
                    <div className="siwc-oauth-login">
                        Who are you? Cannot find your identity...
                    </div>
                    <br />
                    <button 
                        className="btn btn-quiet"
                        onClick={evt => {
                            this.onReAuthenticate(evt); 
                        }}
                    >
                        Re-Authenticate!
                    </button>
                </div>
                }
            </>                    
            : 
            <div className={"siww-panel " + (this.state.theme.webapp.dark_mode ? "dark-mode": "")}>
                <div className="siwc-oauth-login">
                    This application has not defined any data autorization.
                    < br/>
                    Their fault, not yours! 
                    < br/>
                    Cannot grant access with no minimum ID to share...
                </div>
            </div>
            }
            </>  
        )
    }

/*
 *          UI redirect
 */

    renderRedirect() {

        return (
            <>
                <div className={"siww-panel " + (this.state.theme.webapp.dark_mode ? "dark-mode": "")}>
                    <div className="siww_message">
                        <div id="idRedirectMessage" className="transitoryMessage">
                            On your way to {this.state.oauthClientName}...
                        </div>

                        <span>Stay safe online with {this.state.theme.name}</span>
                        <div className="separator"></div>                        
                        <ViewProgressBar
                            theme = {this.state.theme}
                            id = "myRedirectProgressBar"
                            idMessage = "idRedirectMessage"
                        />                            

                    </div>

                    <div className="separator"></div>         

                    <FormAuthenticate 
                        theme = {this.state.theme}
                        aScope = {this.state.aScope}
                        cookie = {this.state.cookie}
                    />

                </div>

            </>
        )
    }

/*
 *          UI generic
 */

    onHover(event, bOver) {
        // who's there?
        let idElt=event.currentTarget;
        let _id=idElt.getAttribute("attr-id");
        try {
            let msg=null;
            if(this.state.isAuthenticated) {
                let i=this.state.aIdentity.findIndex(function (x) {return x.wallet_id===_id});
                if(i!==-1) {
                    if(bOver && i!==this.state.iSelectedIdentity) {
                        msg="Click to preview shared data from your <strong>"+this.state.aIdentity[i].wallet_id+"</strong> wallet's identity.";
                    }
                    else {
                        this.setSharedIdentity(this.state.iSelectedIdentity);
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
                this.setState({hover:msg});
            }
        }
        catch(err) {
        }
    }

    render() {
        return (
            <div id="siwc-login-container" style={this.props.styles.container}>
            {this.props.didSocketConnect ? 
                <div className={"modal-login center-vh" + (this.state.theme.webapp.dark_mode ? "dark-mode": "")} style={this.props.styles.color}>

                    <ViewHeader 
                        client_id= {this.state.client_id}
                        oauthClientName = {this.state.oauthClientName}
                        oauthDomain = {this.state.oauthDomain}
                        isOauth = {true}
                        SIWCLogo = {this.state.theme.logo}
                        theme = {this.state.theme}
                    />

                    {this.state.isAuthenticated && this.state.iSelectedIdentity!==null ? 
                        this.state.isAuthorized? 
                            this.renderRedirect() 
                        :
                            this.renderAuthorization() 
                        : 
                            this.renderAuthentication()
                    }

                    <ViewFooter 
                        theme = {this.state.theme}
                        message = {this.state.hover}
                    />

                </div>
            :
                <div className="loading fullHeight">
                    <div className="loadingText">Waiting for socket connection...</div>
                </div>
            }
        </div>
        )
    }
}

export default AppAuthenticate;
