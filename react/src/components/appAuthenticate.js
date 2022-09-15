import AppConnect from "./appConnect";
import AppAuthHeader from "./appAuthHeader";
import AppAuthFooter from "./appAuthFooter";
import AppAuthProgressBar from "./appAuthProgressBar";
import AppAuthWalletConnect from "./appAuthWalletConnect";

import {srv_prepare} from "../services/authenticate";
import {createPartialIdentity, updatePartialIdentity} from "../services/me";
import jsonwebtoken from "jsonwebtoken";

class AppAuthenticate extends AppConnect {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    

        // params?
        let _client_id=decodeURIComponent(decodeURIComponent(this.getmyuri("client_id", window.location.search)));
        let _oauthDomain=decodeURIComponent(decodeURIComponent(this.getmyuri("domain", window.location.search))).toLowerCase();
        let _oauthClientName=decodeURIComponent(decodeURIComponent(this.getmyuri("name", window.location.search)));
        let _confirm=decodeURIComponent(decodeURIComponent(this.getmyuri("confirm", window.location.search)));
        
        this.state= Object.assign({}, this.state, {

            // webApp requesting authentication
            client_id: _client_id? _client_id : null,
            oauthClientName: _oauthClientName? _oauthClientName : "???",
            oauthDomain: _oauthDomain? _oauthDomain : "unknown",

            // shall we wait for user confirmation?
            mustConfirm: (_confirm==="true"),

            // identity we will use
            wallet_id: null,
            wallet_address: null,
        });
    }

    async async_onAuthCookieReceived(cookie) {
        let eltMe=document.getElementById("me");
        if(eltMe) {
            eltMe.value="";
        }

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

                // check if we agreed to grant our data

                // only if we are on this page... authenticate with the server using our new token
                let eltForm=document.getElementById('form-login');
                if(eltForm) {
                    document.cookie = cookie.name + "=" + cookie.token + ";path=/";
                    document.getElementById('form-login').submit();      // Normal redirect    
                }

                return true;
            }
        })
    }
/*
 *          Wallet interaction
 */

    _prepareSIWC(objIdentityForAuth){
        // can we authenticate with SIWC??
        if(objIdentityForAuth) {

            // get soket... hopefully it s here!
            let _socket=this.props.getSocket();
            if(!_socket || !_socket.id) {
                console.log("Socket not initialized");
                return;
            }

            // now pass details to server, so we get a cookie
            srv_prepare({
                wallet_id: objIdentityForAuth.wallet_id,
                wallet_addr: objIdentityForAuth.wallet_address,    
                socket_id: _socket.id,
                client_id: this.state.client_id
            })
                .then(res => {
                    // ok??
                    if(!res.ok) {
                        throw {
                            data: null,
                            status: res.status,
                            statusText: res.statusText
                        }
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

        let didRequestAuthSIWC=false;
        _aWallet.forEach((item) => {

            if(item.isConnected && item.address) {

                // make sure we have this user's identity in storage
                createPartialIdentity({
                    wallet_address: item.address,
                    wallet_id: item.id,
                    wallet_logo: item.logo
                });

                // use the first wallet to authenticate user with SIWC (only in case we do not have to confirm by user click)
                if(!didRequestAuthSIWC && !this.state.mustConfirm) {
                    didRequestAuthSIWC=true;
                    this._prepareSIWC({
                        wallet_address: item.address,
                        wallet_id: item.id,
                    });        
                }
            }
        }); 
    }
    
    onSIWCNotify_WalletConnected(objParam) {
        super.onSIWCNotify_WalletConnected(objParam);

        // did user just click to accept? we use this as Identity
        if(objParam.didUserClick && objParam.didUserAccept) {
            this._prepareSIWC({
                wallet_address: objParam.address,
                wallet_id: objParam.id,
            });    
        }
    }

/*
 *          UI
 */

    renderWalletSelection(aWallet, iSel) {
        return (
            <div className="identitySelection_container">
                <img className="identity_image" src={aWallet[iSel].wallet_logo? aWallet[iSel].wallet_logo : aWallet[iSel].logo} />
                <select 
                    className="identity_list" 
                    onChange={this.onChangeIdentity}  >
                    
                    {aWallet.map((item, index) => (  
                    <option 
                        id={"wallet_"+index} 
                        key={index}
                        data-provider={item.wallet_id? item.wallet_id : item.id}
                        data-username={item.username? item.username : null}
                        value = {item.username}
                    >
                        {item.wallet_id? item.wallet_id : item.id}
                    </option>
                    ))}
                </select>
            </div>
        )
    }

    render() {
        return(
            <div id="siwc-login-container" style={this.state.styles.container}>
            {this.props.didSocketConnect ? 
                <div className={"modal-login center-vh" + (this.state.theme.dark_mode ? "dark-mode": "")} style={this.state.styles.color}>

                    <AppAuthHeader 
                        client_id= {this.state.client_id}
                        oauthClientName = {this.state.oauthClientName}
                        oauthDomain = {this.state.oauthDomain}
                        isOauth = {true}
                        SIWCLogo = "/assets/images/siwc_logo.png"
                        theme = {this.state.theme}
                    />

                    <div className={"login-line login-line-emph" + (this.state.theme.dark_mode ? "dark-mode": "")}>
                        <div id="idBeforeLogin" className="siwc_before">
                            <form className="hidden" id="form-login" action="/oauth/login" method="POST">
                                <input type="text" id="me" />
                            </form>
                            {this.state.didAccessWallets===false? 
                                <div>
                                    <div id="idTransitoryMessage" className="transitoryMessage">
                                        Please wait<br /> searching for {this.state.theme.name} wallets...
                                    </div>
                                    <AppAuthProgressBar
                                        theme = {this.state.theme}
                                        idMessage = "idTransitoryMessage"
                                    />                            
                                </div>
                            :

                                <>
                                    <div className="siwc-oauth-section">
                                        <strong>Sign-in with {this.state.theme.name}</strong> has detected those wallets:
                                    </div>

                                    {this.state.client_id?
                                        <div
                                            className = "connectCont"
                                        >
                                            {this.state.aWallet.map((item, index) => (
                                            <AppAuthWalletConnect 
                                                theme = {this.state.theme}
                                                client_id = {this.state.client_id}
                                                wallet_id = {item.id}
                                                isConnected = {item.isConnected}
                                                address = {item.address}
                                                logo = {item.logo}
                                                onConnect={this.async_connectWallet.bind(this)}
                                                key = {index}
                                                />
                                            ))}
                                        </div>
                                    :
                                        <>
                                            <div className="transitoryMessage">
                                                Could not identify caller!
                                                <br />
                                                Please <b>Login</b> again from the application.
                                            </div>
                                        </>
                                    }

                                </>
                            }
                        </div>
                    </div>

                    <AppAuthFooter 
                        theme = {this.state.theme}
                    />

                </div>
            :
                <div>
                    Waiting for socket connection...
                </div>
            }
        </div>
        )
    }
}

export default AppAuthenticate;
