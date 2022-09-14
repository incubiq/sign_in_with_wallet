import React, {Component} from "react";
import AppAuthHeader from "./appAuthHeader";
import AppAuthFooter from "./appAuthFooter";
import AppAuthWalletConnect from "./appAuthWalletConnect";
import {setCacheEncryption} from "../services/cache";

import io from 'socket.io-client';
//import siwc from "@incubiq/siwc";                     // real prod
import siwc_connect from "../siwc/siwc_connect";        // for test only

import {getTheme} from "../assets/themes/cardano"; 

import "../assets/css/app.css";
import "../assets/css/siww.css";

class AppConnect extends Component {

/*
 *          page inits
 */

constructor(props) {
        super(props);    
    
        // TODO : we need to pass the key from server (DO NOT KEEP this into prod)
        let _localSecret="cacheEncryptionKey_1234567890";              // encryption key for localstore ; 
        let _cookieSecret="somekey_1234567890";

        setCacheEncryption(_localSecret);

        let objTheme=getTheme();
        this.state={
            // connected wallets
            aWallet: [],                 // all available wallets to connect to  (gathered from connect engine)

            cacheSecret: _localSecret,   // secret to encode localstore
            cookieSecret: _cookieSecret, // secret to decode cookie

            // init vars
            didOpenSocket: false,
            didInitSIWC: false,
            didAccessWallets: false,

            // chain theme
            theme: objTheme
        }

        // Receive the authentication cookie
        let that=this;
        if(!this.state.didOpenSocket) {
            this.setState({didOpenSocket: true});

            this.socket = io("/client");        
            this.socket.on("connect", socket => { 

                // socket ready... let's use SIWC
                if(!this.state.didInitSIWC) {
                    that.setState({didInitSIWC: true});
                    that.siwc=new siwc_connect();
                    that.registerSIWCCallbacks();
                }
            });

            this.socket.on('auth_cookie', cookie => {
                that.onAuthCookieReceived(cookie);
            })    
        }        
    }

    componentDidMount() {
//        this.registerSIWCCallbacks();
    }
    
    onAuthCookieReceived(cookie){
    }

/*
 *          SIWC callbacks
 */

    registerSIWCCallbacks( ){
        // register all callbacks with SIWC
        this.siwc.async_initialize({
            onNotifyAccessibleWallets: function(_aWallet){
                this.onSIWCNotify_WalletsAccessible(_aWallet);
            }.bind(this),
            onNotifyConnectedWallet: function(_wallet){
                this.onSIWCNotify_WalletConnected(_wallet);
            }.bind(this),
            onNotifySignedMessage: function(_wallet){
                this.onSIWCNotify_SignedMessage(_wallet);
            }.bind(this),
        });        
    }

    // called at init (what are those wallets?)
    onSIWCNotify_WalletsAccessible(_aWallet) {
        this.setState({
            aWallet:_aWallet,
            didAccessWallets: true
        });        

        // show connection to those wallets which are connected
        if(this.props.onConnect) {
            _aWallet.forEach((item) => {
                this.props.onConnect(item);
            })
        }
    }

    // processing the wallet connection request (did we really connect?)
    onSIWCNotify_WalletConnected(objParam) {

        // replace an existing entry (case when we connected)
        let i=this.state.aWallet.findIndex(function (x) {return x.id===objParam.id});
        if(i!==-1 && objParam.didUserAccept) {
            let _aWallet=this.state.aWallet.slice();
            _aWallet[i].address=objParam.address;
            this.setState({aWallet:_aWallet});
        }

        // bubble up to listening page
        if(this.props.onConnect) {
            this.props.onConnect(objParam)
        }

        // make sure dialog gets closed and ready to go for another round
        this.onCloseWallet();
    }

    // a message was signed by user
    onSIWCNotify_SignedMessage(objParam) {
        // todo...
        if(objParam.wasSigned) {
            alert("User accepted authentication via "+objParam.id+" wallet");
        }
        else {
            alert("User refused authentication!");
        }
        return;
    }

/*
 *          implement page UI
 */

    getWalletFromId(_id) {
        let i=this.state.aWallet.findIndex(function (x) {return x.id===_id});
        if(i!==-1) {
            return this.state.aWallet[i];
        }
        return null;
    }

    // from UI (close dialog requested)
    onCloseWallet() {
        if(this.props.onClose) {this.props.onClose()}          // notify the listening page 
    }

    // user wants to connect wallet
    async async_connectWallet(event) {

        // who's there?
        let idElt=event.currentTarget;
        let _id=idElt.getAttribute("attr-id");

        try {
            // not waiting for this to finish, it could wait too long
            await this.siwc.async_connectWallet(_id);
            return;
        }
        catch(err) {
            throw err;
        }
    }

    // user wants to sign transaction with a connected wallet (better be a connected wallet or it will not like it)
    async async_signMessage(event) {
        let idElt=event.target;
        let _id=idElt.getAttribute("attr-id");
        try {

            const objSiwcMsg = await this.siwc.async_createMessage(_id, {
                message: "something i d like to say",
                valid_for: 300,                 // 5min validity from when it is sent
            });
    
            // not waiting for this to finish, it could wait too long
            this.siwc.async_signMessage(_id, objSiwcMsg, "authentication");
        }
        catch(err) {
            alert("Error when signning message ("+err.message+")");
        }
    }

    getShortenAnonAddress(_address) {
        if(!_address)
            return "";
        return _address.substr(0,4)+"..."+_address.substr(_address.length-6,6)
    }

    getStyles() {
        const styleContainer = {}
        const styleColor = {}
        if (this.state.theme && this.state.theme.background) {
            styleContainer.backgroundImage="url("+this.state.theme.background+")";
        }
        if (this.state.theme && this.state.theme.color.text) {
            styleColor.color=this.state.theme.color.text;
        }
        return {
            container: styleContainer,
            color: styleColor
        }
    }

    render() {
        let objStyles=this.getStyles();
        return( 
            <div>
                {this.state.didAccessWallets===false ? 
                    <span>Please wait... Looking for Cardano Wallets...</span>  
                :   
                    this.state.aWallet.length>0 ? 
                    <>
                        <div>
                            {this.state.aWallet.length + " wallets found!"}
                        </div>
                        {this.state.aWallet.map((item, index) => (
                            <div
                                className = "connectContainer"
                                key={index}
                            >
                                <button 
                                    className={item.isConnected? "btn disabled" : "btn"}
                                    attr-id={item.id}
                                    onClick={this.async_connectWallet.bind(this)}
                                >{item.isConnected? "Connected to"+item.name: "Connect to "+item.name}...</button>
                                <ul>
                                    <li>{"Status: " + (item.isConnected? "connected": "not connected")}</li>
                                    <li className={item.isConnected?"" : "noshow"}>{"Address: "+this.getShortenAnonAddress(item.address)}</li>
                                    <li className={item.isConnected?"" : "noshow"}>
                                        <button
                                            className="btn"
                                            attr-id={item.id}
                                            onClick={this.async_signMessage.bind(this)}
                                        >Sign-in with Cardano</button>
                                    </li>
                                </ul>
                            </div>
                        ))}
                    </>
                    : 
                    <span>Huhhh! No cardano wallet found!!!</span>
                }
            </div>                               
        )
    }
}

export default AppConnect;
