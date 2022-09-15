import {Component} from "react";

class AppAuthWalletConnect extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);        
    }

/*
 *          
 */
    onConnect(event) {
        if(this.props.onConnect) {
            this.props.onConnect(event);
            // this.props.loginUrl    
        }
    }

    render() {
        const style = {}
        if (this.props.theme && this.props.theme.color) {
            style.color=this.props.theme.color.button_text+" !important";
            style.background=this.props.theme.color.button+" !important";
        }

        return (    
            <div 
                id={"btnLoginWithWallet_"+ this.props.wallet_id}
                attr-id={this.props.wallet_id}
                key={this.props.key}
                className={"wallet-sign" + (this.props.isConnected? " connected": " disconnected")} 
                style={style} 
                onClick={function(evt) {this.onConnect(evt)}.bind(this) }
            >
                <div className="connectWalletLogoContainer"> 
                    <img className="connectWalletLogo" src={this.props.logo ? this.props.logo : ""} />  
                </div>
                <div className="connectWalletTitle" id="loginWithWallet">{this.props.wallet_id}</div>
            </div>
        )
    }
}

export default AppAuthWalletConnect;
