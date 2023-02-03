import {Component} from "react";
import {CRITICALITY_SEVERE} from "../const/message";

let _isMounted=false;
class ViewWalletConnect extends Component {

/*
 *      Inits
 */
    
    constructor(props) {
        super(props);    
        this.state={            
            isConnecting: false
        }
    }

    componentDidMount() {
        _isMounted=true;
    }

    componentWillUnmount() {
        // a bit shit, we remove the connecting effect before unmounting
        this.setState({isConnecting: false});
        _isMounted=false;
    }

    isMounted( ){return _isMounted}

/*
 *      UI
 */

    async async_onConnect(event) {
        if(this.props.onConnect) {

            // who's there?
            let idElt=event.currentTarget;
            let _id=idElt.getAttribute("attr-id");
            
            // waiting/loading effect
            if(this.isMounted()) {
                this.setState({isConnecting: true});
                if(this.props.fnShowMessage) {
                    this.props.fnShowMessage({
                        message: "Connecting to your <b>"+_id+"</b> wallet...", 
                        hasTimerEffect: true
                    });
                }    
            }

            let data=await this.props.onConnect(_id);
            if(this.isMounted()) {
                this.setState({isConnecting: false});
            }

            if(data.error) {
                if(this.props.fnShowMessage) {
                    this.props.fnShowMessage({
                        message: data.error,
                        criticality: CRITICALITY_SEVERE,
                        hasTimerEffect: false
                    });
                }
            }
            else {
                if(data.didUserAccept && this.isMounted()) {
                    if(this.props.fnShowMessage) {
                        this.props.fnShowMessage({
                            message: "Connected to your <b>"+_id+"</b> wallet...", 
                            hasTimerEffect: false
                        });
                    }
                }    
            }
        }
    }

    onHover(event, bOver) {
        // who's there?
        let idElt=event.currentTarget;
        let _id=idElt.getAttribute("attr-id");
        let msg=null;
        
        if(_id && bOver && this.props.fnShowMessage && !this.state.isConnecting) {
            // default message if select Wallet Connect OR Identity
            msg="Click to choose <strong>"+_id+"</strong> wallet as the signing identity."
            if(this.props.isConnected===false) {msg="Click to add <strong>"+_id+"</strong> wallet as a signing identity."}
        }

        if(msg) {
            this.props.fnShowMessage({message: msg});
        }
    }

    render() {
        const style = {}
        if (this.props.theme && this.props.theme.color) {
            style.color=this.props.theme.color.button_text+" !important";
            style.background=this.props.theme.color.button+" !important";
        }

        return (    
            <li 
                id={"btnLoginWithWallet_"+ this.props.wallet_id}
                attr-id={this.props.wallet_id}
                key={this.props.index}
                className={"wallet-sign" + (this.props.isSelected? " selected " : this.props.isConnected? " connected" : " ")} 
                style={style} 
                onClick={evt => {this.async_onConnect(evt)} }
                onMouseOver={evt => {this.onHover(evt, true) }}
                onMouseLeave={evt => {this.onHover(evt, false) }}
            >
                <div className={"connectWalletLogoContainer" + (this.state.isConnecting? " connecting": "")}> 
                    {this.state.isConnecting? 
                        <div className="connectWalletLogo connecting">⌛</div>  
                    :
                    <>
                        <img className="connectWalletLogo" src={this.props.logo ? this.props.logo : ""} alt={this.props.wallet_name} title={this.props.wallet_name} />  
                        <div className="connectWalletTitle" >{this.props.wallet_name}</div>
                    </>
                    }
                </div>
            </li>
        )
    }
}

export default ViewWalletConnect;
