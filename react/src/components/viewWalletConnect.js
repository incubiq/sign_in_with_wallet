import {Component} from "react";

class ViewWalletConnect extends Component {

/*
 *      UI
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
                className={"wallet-sign" + (this.props.isSelected? " selected " : this.props.isConnected? " connected" : " ")} 
                style={style} 
                onClick={evt => {this.onConnect(evt)} }
                onMouseOver={evt => {if(this.props.onHover) {this.props.onHover(evt, true); }}}
                onMouseLeave={evt => {if(this.props.onHover) {this.props.onHover(evt, false); }}}
            >
                <div className="connectWalletLogoContainer"> 
                    <img className="connectWalletLogo" src={this.props.logo ? this.props.logo : ""} alt="logo" />  
                </div>
                <div className="connectWalletTitle" >{this.props.wallet_id}</div>
            </li>
        )
    }
}

export default ViewWalletConnect;
