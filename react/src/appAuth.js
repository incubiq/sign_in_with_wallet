import React, {Component} from "react";
import siwc_connect from "./connectCardano";
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
        this.siwc_registerCallbacks();
    }

/*
 *          SIWC callbacks
 */

    siwc_registerCallbacks( ){
        // register all callbacks with SIWC
        let that=this;
        this.siwc.async_initialize({
            onNotifyAccessibleWallets: function(_aWallet){
                that.siwc_onNotifyWalletsAccessible(_aWallet);
            },
            onNotifyConnectedWallet: function(_wallet){
                that.siwc_onNotifyWalletConnected(_wallet);
            },
            onNotifySignedMessage: function(_wallet){
                that.siwc_onNotifySignedMessage(_wallet);
            },
        });
        
    }

    // called at init (what are those wallets?)
    siwc_onNotifyWalletsAccessible(_aWallet) {
        this.setState({aWallet:_aWallet});

        // show connection to those wallets which are connected
        if(this.props.onConnect) {
            _aWallet.forEach((item) => {
                this.props.onConnect(item);
            })
        }
    }

    // processing the wallet connection request (did we really connect?)
    siwc_onNotifyWalletConnected(objParam) {

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
    siwc_onNotifySignedMessage(objParam) {
        // todo...
        if(objParam.wasSigned) {
            alert("Signed by "+objParam.id+" ("+objParam.message+")");
        }
        return;
    }

/*
 *          implement page UI
 */

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
            const objSiwcMsg = await this.siwc.async_createMessage(_id, {
                message: "something i d like to say",
                domain: null            // todo : this and more....
            });
    
            // not waiting for this to finish, it could wait too long
            this.siwc.async_signMessage(_id, objSiwcMsg);
        }
        catch(err) {
            throw err;
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
                            className="btn"
                            attr-id={item.id}
                            onClick={this.async_connectWallet.bind(this)}
                        >Connect to {item.name}...</button>
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
