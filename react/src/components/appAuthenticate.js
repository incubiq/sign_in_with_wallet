import AppConnect from "./appConnect";
import AppAuthHeader from "./appAuthHeader";
import AppAuthFooter from "./appAuthFooter";
import AppAuthProgressBar from "./appAuthProgressBar";
import AppAuthWalletConnect from "./appAuthWalletConnect";

import {srv_prepare} from "../services/authenticate";
import {ensureIdentity, updateIdentity} from "../services/me";
import jsonwebtoken from "jsonwebtoken";

class AppAuthenticate extends AppConnect {

/*
 *          page inits
 */

constructor(props) {
        super(props);    

        // params?
        let _search=window.location.search;
        let _client_id=decodeURIComponent(decodeURIComponent(this.getmyuri("client_id", _search)));
        let _oauthDomain=decodeURIComponent(decodeURIComponent(this.getmyuri("domain", _search))).toLowerCase();
        let _oauthClientName=decodeURIComponent(decodeURIComponent(this.getmyuri("name", _search)));
        
        this.state= Object.assign({}, this.state, {

            client_id: _client_id? _client_id : null,
            oauthClientName: _oauthClientName? _oauthClientName : "???",
            oauthDomain: _oauthDomain? _oauthDomain : "unknown",

            wallet_id: null,
            wallet_address: null,

        });
    }

    getmyuri(n,s){
        n = n.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
        var p = (new RegExp("[\\?&]"+n+"=([^&#]*)")).exec(s);
        return (p===null) ? "" : p[1];
      }
    
    onAuthCookieReceived(cookie) {
        let eltMe=document.getElementById("me");
        if(eltMe) {
            eltMe.value="";
        }

        jsonwebtoken.verify(cookie.token, this.state.cookieSecret, function(err, decoded){
            if(err) {
                console.log("Error decoding Cookie in REACT");
            }
            else {
                // cookie contains new username (created by backend) => store it
                updateIdentity(decoded.wallet_address, {
                    username: decoded.username
                });

                // check if we agreed to grant our data

                // normal page... authenticate with the server using our new token
                document.cookie = cookie.name + "=" + cookie.token + ";path=/";
                document.getElementById('form-login').submit();      // Normal redirect

            }
        })
    }
/*
 *          Wallet interaction
 */

    _prepareSIWC(objIdentityForAuth){
        // can we authenticate with SIWC??
        if(objIdentityForAuth) {

            // now pass details to server, so we get a cookie
            srv_prepare({
                wallet_id: objIdentityForAuth.wallet_id,
                wallet_addr: objIdentityForAuth.wallet_address,    
                socket_id: this.socket.id,
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
                ensureIdentity({
                    wallet_address: item.address,
                    wallet_id: item.id
                });

                // use the first wallet to authenticate user with SIWC
                if(!didRequestAuthSIWC) {
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

    render() {
        let objStyles=this.getStyles();
        return(
            <div id="siwc-login-container" style={objStyles.container}>
                <div className={"modal-login center-vh" + (this.state.theme.dark_mode ? "dark-mode": "")} style={objStyles.color}>

                    <AppAuthHeader 
                        client_id= {this.state.client_id}
                        oauthClientName = {this.state.oauthClientName}
                        oauthDomain = {this.state.oauthDomain}
                        isOauth = {true}
                        SIWCLogo = "/assets/images/siwc_logo.png"
                        theme = {this.state.theme}
                    />

                    <div id="idBeforeLogin" className="siwc_before">
                        <form className="hidden" id="form-login" action="/oauth/login" method="POST">
                            <input type="text" id="me" />
                        </form>
                        {

                        this.state.didAccessWallets===false? 
                            <div>
                                <div id="idTransitoryMessage" className="transitoryMessage">
                                    Please wait<br /> searching for Cardano wallets...
                                </div>
                                <AppAuthProgressBar
                                    theme = {this.state.theme}
                                    idMessage = "idTransitoryMessage"
                                />                            
                            </div>
                        :

                        this.state.aWallet.map((item, index) => (
                            <div
                                className = "connectCont"
                                key={index}
                            >
                                <AppAuthWalletConnect 
                                    theme = {this.state.theme}
                                    client_id = {this.state.client_id}
                                    wallet_id = {item.id}
                                    isConnected = {item.isConnected}
                                    address = {item.address}
                                    logo = {item.logo}
                                    onConnect={this.async_connectWallet.bind(this)}
                                />
                            </div>
                        ))
                        }
                    </div>

                    <AppAuthFooter 
                        theme = {this.state.theme}
                    />

                </div>
            </div>
        )
    }
}

export default AppAuthenticate;
