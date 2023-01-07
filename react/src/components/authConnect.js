import AppBase from "./appBase";
import {WidgetMessage} from "../utils/widgetMessage";

// for test only
//import siww from "../siwc/siww";        
//const SIWW=new siww();

// real prod
const SIWW = require('@incubiq/siww');

class AuthConnect extends AppBase {

/*
 *          page inits
 */

constructor(props) {
        super(props);    
        this.state= Object.assign({}, this.state, {
            // connected wallets
            aWallet: [],                 // all available wallets to connect to  (gathered from connect engine)

            // init vars
            didInitSIWW: false,
            didAccessWallets: false,
        });
    }

    componentDidMount() {
        super.componentDidMount();
        if(!this.state.didInitSIWW) {
            this.initChain(this.props.chain);
        }        
    }
    
    componentDidUpdate(prevProps) {
        super.componentDidUpdate(prevProps);
        
        //  ready? let's use SIWC
        if(!this.state.didInitSIWW) {
            this.initChain(this.props.chain);
        }        
    }

    initChain(_chain) {
        this.setState({didInitSIWW: true});
        switch(_chain) {
            case "cardano":
                this.connectCardano();
                break;

            default:
                console.log("Unknown chain to connect to!");
                break;
        }

    }

/*
 *          SIWC inits + callbacks
 */

    connectCardano() {
        this.siww=SIWW.getConnector("cardano");
        this.registerSIWCCallbacks();
    }

    registerSIWCCallbacks( ){
        // register all callbacks with SIWC
        this.siww.async_initialize({
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
    }

    // processing the wallet connection request (did we really connect?)
    onSIWCNotify_WalletConnected(objParam) {

        // replace an existing entry (case when we connected)
        let i=this.state.aWallet.findIndex(function (x) {return x.id===objParam.wallet.id});
        if(i!==-1 && objParam.didUserAccept) {
            let _aWallet=this.state.aWallet.slice();
            _aWallet[i].address=objParam.wallet.address;
            _aWallet[i].hasConnected=true;
            this.setState({aWallet:_aWallet});

            this.siww.async_getConnectedWalletExtendedInfo(_aWallet[i])
            .then(objWallet => {
                let j=this.state.aWallet.findIndex(function (x) {return x.id===objWallet.id});
                _aWallet[j]=objWallet;
            })
        }

        // bubble up to listening page
        if(this.props.onConnect) {
            this.props.onConnect(objParam.wallet)
        }

        // make sure dialog gets closed and ready to go for another round
        this.onCloseWallet();
    }

    // a message was signed by user
    onSIWCNotify_SignedMessage(objParam) {
        // todo...
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
    async async_connectWallet(_id) {

        try {
            // not waiting for this to finish, it could wait too long
            await this.siww.async_connectWallet(_id);
            return;
        }
        catch(err) {
            throw err;
        }
    }

    // user wants to sign transaction with a connected wallet (better be a connected wallet or it will not like it)
    async async_signMessage(_id, appDomain) {
        if(!appDomain) {appDomain="localhost";}
        try {

            const objSiwcMsg = await this.siww.async_createMessage(_id, {
                message: "Sign this message to authorize authentication into "+appDomain,
                version: this.props.version,
                valid_for: 300,                 // 5min validity from when it is sent
            });
    
            // get the Cose to validate server side
            let res=await this.siww.async_signMessage(_id, objSiwcMsg, "authentication");
            return res;
        }
        catch(err) {
            alert("Error when signning message ("+err.message+")");
        }
        return null;
    }

    getShortenAnonAddress(_address) {
        if(!_address)
            return "";
        return _address.substr(0,4)+"..."+_address.substr(_address.length-6,6)
    }

    renderWalletConnect () {
        return (
            <>
            {this.state.aWallet.map((item, index) => (
                <div
                    className = "connectContainer"
                    key={index}
                >
                    <button 
                        className={item.isEnabled? "btn disabled" : "btn"}
                        attr-id={item.id}
                        onClick={(event) => {
                            let idElt=event.currentTarget;
                            let _id=idElt.getAttribute("attr-id");
                            this.async_connectWallet(_id);
                        }
                    }
                    >{item.isConnected? "Connected to"+item.name: "Connect to "+item.name}...</button>
                    <ul>
                        <li>{"Status: " + (item.isEnabled? "connected": "not connected")}</li>
                        <li className={item.isEnabled?"" : "noshow"}>{"Address: "+this.getShortenAnonAddress(item.address)}</li>
                        <li className={item.isEnabled?"" : "noshow"}>{"Balance: "+(item.balance? item.balance.ptr : "")}</li>

                        <ul>
                        {item.utxos? item.utxos.map((utxo, idx)  => (
                            <li key={idx} className={item.isEnabled?"" : "noshow"}>
                                <a target="_blank" href={"https://testnet.cexplorer.io/"+utxo}> {"UTXO: "+this.getShortenAnonAddress(utxo) }</a>
                            </li>
                        )) 
                        :""}
                        </ul>

                        <li className={item.isEnabled?"" : "noshow"}>
                            <button
                                className="btn"
                                attr-id={item.id}
                                onClick={evt => {
                                    let idElt=evt.target;
                                    let _id=idElt.getAttribute("attr-id");
                                    this.async_signMessage(_id, "localhost").bind(this)}}
                            >Sign-in Message...</button>
                        </li>
                    </ul>
                </div>
            ))}
        </>);
    }

    render() {
        return( 
            <div>
                {this.state.didAccessWallets===false ? 
                    <WidgetMessage 
                        headline = "Please wait..."
                        text = "Looking for Wallets..."
                    />
                :   
                    this.state.aWallet.length>0 ? 
                    <>
                        <div>
                            {this.state.aWallet.length + " wallets found!"}
                        </div>

                        {this.renderWalletConnect()}
                    </>
                    : 
                    <WidgetMessage 
                        error = {true}
                        headline = "Oh my! "
                        text = "No wallet found!"
                    />
                }
            </div>                               
        )
    }
}

export default AuthConnect;
