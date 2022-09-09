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
                
            <div className="login-line login-line-emph">
            {this.props.client_id?

                <button 
                    id={"btnLoginWithWallet_"+ this.props.wallet_id}
                    attr-id={this.props.wallet_id}
                    className={"btn btn-quiet" + (this.props.isConnected? "": "")} 
                    style={style} 
                    onClick={function(evt) {this.onConnect(evt)}.bind(this) }
                >
                    {this.props.logo ? <img className="connectWalletLogo" src={this.props.logo} /> : ""}                    
                    <span>Sign in with </span>
                    &nbsp;
                    <span id="loginWithWallet">{this.props.wallet_id}</span>
                </button>

            :
                <>
                    <div className="transitoryMessage">
                        Could not identify caller!
                        <br />
                        Please <b>Login</b> again from the application.
                    </div>
                </>
            }
            </div>

        )
    }
}

export default AppAuthWalletConnect;
