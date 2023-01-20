import {CRITICALITY_SEVERE} from "../const/message";
import ViewWalletConnect from "./viewWalletConnect";

let isMounted=false;
class ViewIdentitySelect extends ViewWalletConnect {

/*
 *      UI
 */

    async async_onConnect(event) {
        if(this.props.onConnect) {

            // who's there?
            let idElt=event.currentTarget;
            let _id=idElt.getAttribute("attr-id");
            
            // waiting/loading effect
            if(isMounted) {
                this.setState({isConnecting: true});
                if(this.props.fnShowMessage) {
                    this.props.fnShowMessage({
                        message: "Connecting to your <b>"+_id+"</b> wallet...", 
                        hasTimerEffect: true
                    });
                }    
            }

            let data=await this.props.onConnect(_id);
            this.setState({isConnecting: false});

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
                if(data.didUserAccept && isMounted) {
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
            msg=this.props.isConnected ? 
                "Click to choose <strong>"+_id+"</strong> wallet as the signing identity."
                : "Click to add <strong>"+_id+"</strong> wallet as a signing identity.";
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
                <div className="identitySelectContainer"> 
                    <img className="IdentitySelectChainLogo" src={this.props.blockchain_image ? "/assets/images/"+this.props.blockchain_image : ""} alt={this.props.blockchain_name} title={this.props.blockchain_name} />  
                    <img className="IdentitySelectWalletLogo" src={this.props.wallet_logo ? this.props.wallet_logo : ""} alt={this.props.wallet_name} title={this.props.wallet_name} />  
                    <div className="IdentitySelectWalletName" >{this.props.wallet_name}</div>
                </div>
            </li>
        )
    }
}

export default ViewIdentitySelect;
