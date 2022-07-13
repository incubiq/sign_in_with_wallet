import React, {Component} from "react";
import siwc_connect from "./siwc_connect";
import "./app.css";

class AppDemoAuth extends Component {

/*
 *          page inits
 */

constructor(props) {
        super(props);    
    
        this.state={
            aWallet: [],                // all available wallets to connect to  (gathered from connect engine)
            idWallet : null             // the idWallet requested to connect to
        }

        // let's use SIWC
        this.siwc=new siwc_connect();
    }

    componentDidMount() {
        this.registerSIWCCallbacks();
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
        this.setState({aWallet:_aWallet});

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
        if(i!==-1) {
            let _aWallet=this.state.aWallet.slice();
            _aWallet[i]=objParam;
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
        this.setState ({idWallet:null});                       // also to make sure we can reconnect again on same later on
        if(this.props.onClose) {this.props.onClose()}          // notify the listening page 
    }

    // user wants to connect wallet
    async async_connectWallet(event) {

        // who's there?
        let idElt=event.target;
        let _id=idElt.getAttribute("attr-id");

        try {
            // not waiting for this to finish, it could wait too long
            this.siwc.async_connectWallet(_id);
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
            let _host=window.location.hostname;
            if(window.location.port!=="") {
                _host=_host+":"+window.location.port;
            }

            let now = new Date(); 
            let nowUtc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

            const objSiwcMsg = await this.siwc.async_createMessage(_id, {
                message: "something i d like to say",
                domain: _host,
                issued_at: nowUtc,
                valid_for: 300,                 // 5min validity
            });
    
            // not waiting for this to finish, it could wait too long
            this.siwc.async_signMessage(_id, objSiwcMsg);
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

    render() {
        return (
            <div>
                in route Auth ....
                <br />
                <br />
                <span>
                    {this.state.aWallet.length + " wallets found!"}
                </span>

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
            </div>
        )
    }
}

export default AppDemoAuth;
