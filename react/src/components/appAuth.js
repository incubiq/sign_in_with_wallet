import AppConnect from "./appConnect";
import AppAuthHeader from "./appAuthHeader";
import AppAuthFooter from "./appAuthFooter";
import AppAuthProgressBar from "./appAuthProgressBar";
import AppAuthWalletConnect from "./appAuthWalletConnect";

import {srv_prepare} from "../services/authenticate";
import io from 'socket.io-client';

class AppAuth extends AppConnect {

/*
 *          page inits
 */

constructor(props) {
        super(props);    

        // Receive the authentication cookie
        const socket = io("/client");        
        socket.on('auth_cookie', cookie => {        
            // normal page... authenticate with the server using our new token
            document.cookie = cookie.name + "=" + cookie.token + ";path=/";
            document.getElementById('form-login').submit();      // Normal redirect
        });

        // params?
        let _search=window.location.search;
        let _client_id=decodeURIComponent(decodeURIComponent(this.getmyuri("client_id", _search)));
        let _oauthDomain=decodeURIComponent(decodeURIComponent(this.getmyuri("domain", _search))).toLowerCase();
        let _oauthClientName=decodeURIComponent(decodeURIComponent(this.getmyuri("name", _search)));
    
        this.state= Object.assign({}, this.state, {

            client_id: _client_id? _client_id : null,
            oauthClientName: _oauthClientName? _oauthClientName : "???",
            oauthDomain: _oauthDomain? _oauthDomain : "unknown",

            theme:{
                dark_mode: false,
                background:  "/assets/images/siwc_background.jpg",
                logo: "/assets/images/www_logo.png",
                color: {
                    text: "#333",
                    button: "#003366",
                    button_text: "#f0f0f0"
                }
            }
        });
    }

    getmyuri(n,s){
        n = n.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
        var p = (new RegExp("[\\?&]"+n+"=([^&#]*)")).exec(s);
        return (p===null) ? "" : p[1];
      }
    
/*
 *          Wallet interaction
 */

    onSIWCNotify_WalletConnected(objParam) {
        super.onSIWCNotify_WalletConnected(objParam);

        // notify 
        // now pass details to server, so we get a cookie
        if(objParam.wasConnected) {
            srv_prepare({
                wallet_id: objParam.id,
                wallet_addr: objParam.address,
                socket_id: "auth_cookie",
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

/*
 *          UI
 */

    render() {
        const styleContainer = {}
        const styleColor = {}
        if (this.state.theme && this.state.theme.background) {
            styleContainer.backgroundImage="url("+this.state.theme.background+")";
        }
        if (this.state.theme && this.state.theme.color.text) {
            styleColor.color=this.state.theme.color.text;
        }

        return(
            <div id="siwc-login-container" style={styleContainer}>
                <div className={"modal-login center-vh" + (this.state.theme.dark_mode ? "dark-mode": "")} style={styleColor}>

                    <AppAuthHeader 
                        client_id= {this.state.client_id}
                        oauthClientName = {this.state.oauthClientName}
                        oauthDomain = {this.state.oauthDomain}
                        isOauth = {true}
                        SIWCLogo = "/assets/images/siwc_logo.png"
                        theme = {this.state.theme}
                    />

                    <div id="idBeforeLogin" className="siwc_before">
                        <form className="hidden" id="form-login" action="/oauth/login" method="POST"></form>
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

export default AppAuth;
