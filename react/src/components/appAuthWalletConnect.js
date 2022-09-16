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
            <li 
                id={"btnLoginWithWallet_"+ this.props.wallet_id}
                attr-id={this.props.wallet_id}
                key={this.props.index}
                className={"wallet-sign" + (this.props.isConnected? " connected ": " disconnected ") + (this.props.isSelected? " selected " :"")} 
                style={style} 
                onClick={evt => {this.onConnect(evt)} }
                onMouseOver={evt => {if(this.props.onHover) {this.props.onHover(evt, true); }}}
                onMouseLeave={evt => {if(this.props.onHover) {this.props.onHover(evt, false); }}}
            >
                <div className="connectWalletLogoContainer"> 
                    <img className="connectWalletLogo" src={this.props.logo ? this.props.logo : ""} />  
                </div>
                <div className="connectWalletTitle" id="loginWithWallet">{this.props.wallet_id}</div>
            </li>
        )
    }
}

export default AppAuthWalletConnect;
