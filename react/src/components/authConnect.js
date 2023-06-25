import AppBase from "./appBase";
import {WidgetMessage} from "../utils/widgetMessage";
import {getDefault} from "../const/connectors"; 
import {CRITICALITY_SEVERE} from "../const/message";

// for test only
//import siww from "../siww/siww";        
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

            // connectors
            aActiveConnector: [],        // all those connectors which have detected at least a window.<connector> to work with             
            iActiveConnector: null,      // the active connector

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
            this.initChain();
        }        
    }
    
    componentDidUpdate(prevProps) {
        super.componentDidUpdate(prevProps);
        
        //  ready? let's use SIWC
        if(!this.state.didInitSIWW) {
            this.initChain();
        }        
    }

/*
 *          inits Wallet Connectors
 */

    initChain() {
        // UI effect
        this.setState({inTimerEffect: true});

        // init all connectors
        let _aActive=[];
        this.setState({didInitSIWW: true});
        let _objConnector=SIWW.getAllConnectorsWithMetadata();
        let _ct=null;
        _objConnector.aConnector.forEach(item => {
            _ct=this.createConnector(_objConnector[item].symbol);
            if(_ct && _objConnector[item].symbol!=="SIWP") {
                // add to active bloackchain to explore, if can see it
                _objConnector[item].aAcceptedBlockchain=_ct.getAcceptedChains();
                if(window[_objConnector[item].window]) {
                    _aActive.push({
                        symbol: item,                    
                        connector: _ct,
                        assets: _objConnector[item],
                        hasNotified: false,         // have we been notified by the connector that it is active?
                        isAccepted: true            // is the blockchain from the connector an accepted one?
                    });
                }
            }
        });

        this.setState({aActiveConnector: _aActive});
    }

    getSIWW() {
        return SIWW;
    }

    createConnector(_name) {
        let _connector=SIWW.getConnector(_name);
        this.registerSIWCCallbacks(_connector);
        return _connector;
    }

    updateActiveConnector(objIdentity) {
        if(!objIdentity) {
            this.setState({iActiveConnector: null});
            this.setState({wallet_name: "Wallet"});
        }
        else {
            let _aC=this.state.aActiveConnector;
            for (var i=0; i<this.state.aActiveConnector.length; i++) {
                if(this.state.aActiveConnector[i].symbol===objIdentity.connector) {

                    // is this this an accepted blockchain?
                    _aC[i].isAccepted=_aC[i].assets.aAcceptedBlockchain.some(item => item.symbol === objIdentity.blockchain_symbol);

                    // maybe not known but we have a networkId? then it s a anon one and we accept
                    if(!_aC[i].isAccepted && _aC[i].assets.blockchain_networkId!==0) {
                        _aC[i].isAccepted=true;
                    }

                    // add blockchain info and update name (Metamask can work on multi chain, we want to display the active chain only)
                    _aC[i].assets.blockchain_image = objIdentity.blockchain_image;
                    _aC[i].assets.blockchain_name = objIdentity.blockchain_name;
                    _aC[i].assets.blockchain_symbol = objIdentity.blockchain_symbol;
                    _aC[i].assets.blockchain_networkId = objIdentity.blockchain_networkId;

                    // add wallet info too 
                    _aC[i].assets.wallet_id = objIdentity.wallet_id;
                    _aC[i].assets.wallet_name = objIdentity.wallet_name;
                    _aC[i].assets.wallet_logo = objIdentity.wallet_logo;

                    // set it
                    this.setState({aActiveConnector: _aC});    
                    this.setState({iActiveConnector: i});
                    return _aC[i].isAccepted;
                }
            }    
        }
        return true;
    }

    registerSIWCCallbacks(_connector){
        // register all callbacks with SIWW
        _connector.async_initialize({
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

/*
 *          calls & callbacks to Wallet Connectors
 */

    // called at init (what are those wallets?)
    onSIWCNotify_WalletsAccessible(_aWallet) {
        
        // update the current list of wallets (do not duplicate)
        let _aCurrent=this.state.aWallet;
        let _aActive=this.state.aActiveConnector;
        let _hasReceivedAllNotifications=false;
        _aWallet.forEach(item => {
            let bFound = false;
            for (var i=0; i< _aCurrent.length; i++) {
                let i=_aCurrent.findIndex(function (x) {return x.id===item.id});
                if(i!==-1) {bFound=true;}
            }

            if(!bFound) {
                _aCurrent.push(item);

                // update active connectors 
                let _cC=0;
                for (var j=0; j<_aActive.length; j++) {
                    if(_aActive[j].connector === item.connector) {
                        _aActive[j].hasNotified=true;
                    }
                    if(_aActive[j].hasNotified) {_cC++}
                }
                this.setState({aActiveConnector: _aActive});
                _hasReceivedAllNotifications=_cC===_aActive.length;
            }
        });

        // update UI (remove loading effect when we got all our replies)
        if(_hasReceivedAllNotifications) {
            this.setState({inTimerEffect: false});
        }

        this.setState({
            aWallet:_aCurrent,
            didAccessWallets: true
        });        

        return _aCurrent;
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

            SIWW.async_getConnectedWalletExtendedInfo(_aWallet[i].id)
            .then(objWallet => {
                let j=this.state.aWallet.findIndex(function (x) {return x.id===objWallet.id});
                _aWallet[j]=objWallet;
            })

            // bubble up to listening page
            if(this.props.onConnect) {
                this.props.onConnect(objParam.wallet)
            }
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
            return await SIWW.async_connectWallet(_id);
        }
        catch(err) {
            throw err;
        }
    }

    // user wants to sign transaction with a connected wallet (better be a connected wallet or it will not like it)
    async async_signMessage(_id, appDomain) {
        if(!appDomain) {appDomain="localhost";}
        try {

            const objSiwcMsg = await SIWW.async_createMessage(_id, {
                message: "Sign to authorize authentication into "+appDomain,
                version: this.props.version,
                valid_for: 300,                 // 5min validity from when it is sent
            });
    
            // get the Cose to validate server side
            let res=await SIWW.async_signMessage(_id, objSiwcMsg, "authentication");
            return res;
        }
        catch(err) {
            this.setState({hover: err.message});
            this.setState({criticality:CRITICALITY_SEVERE});    
        }
        return null;
    }

    getActiveConnector() {
        if(this.state.iActiveConnector!==null) {
            return this.state.aActiveConnector[this.state.iActiveConnector];
        }

        let _assets=getDefault();
        return {
            isAccepted: true,
            symbol: _assets.symbol,                    
            connector: null,
            assets: _assets
        }
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
                                <a target="_blank" href={"https://testnet.cexplorer.io/"+utxo} rel="noreferrer" > {"UTXO: "+this.getShortenAnonAddress(utxo) }</a>
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
