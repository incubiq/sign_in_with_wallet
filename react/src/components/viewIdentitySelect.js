import {CRITICALITY_SEVERE} from "../const/message";
import ViewWalletConnect from "./viewWalletConnect";

class ViewIdentitySelect extends ViewWalletConnect {

/*
 *      UI
 */

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
