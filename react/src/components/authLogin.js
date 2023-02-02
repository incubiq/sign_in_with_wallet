import AuthAuthenticate from "./authAuthenticate";
import ViewWallets from "./viewWallets";

// class for logging into SIWW backend (for user "admin" purposes)
// this is NOT used for oAuth login as an end user

//
// !!!! IS NOW REPLACED BY PROPER OAUTH !!!!
//

class AuthLogin extends AuthAuthenticate {

    constructor(props) {
        super(props);    
        this.setConfirmLogin();     // if we come here... we must confirm login (no auto login)
    }

/*
 *          SIWC inits + callbacks
 */

    // called when wallet connect or if cookie is already here
    async async_onAuthCookieReceived(_token) {        
        let isOK=await super.async_onAuthCookieReceived(_token);
        if(isOK) {
            // ping backend with cookie to make sure we have it loaded in browser for next calls
            let eltForm=document.getElementById('form-silentLogin');
            if(eltForm) {
                document.cookie = this.props.AuthenticationCookieName + "=" + _token + ";path=/";
                eltForm.submit();
            }            
        }
        else {
            // cookie not valid... we need to ask for another one
            return;
        }
    }

    render() {
        return( 
            <>
                <form  id="form-silentLogin" action={this.props.host+"api/v1/private/login"} method="POST" className="hidden">
                    <input 
                        type="text"
                        id="root"
                        value={window.location.origin}
                        onChange = {() => {}}
                    />
                </form>

                <div className="center-vh">

                    {this.state.didAccessWallets===false? 
                        <div className="siww-panel">
                            Loading wallets, please wait a moment...
                        </div>
                    :
                    this.state.aWallet && this.state.aWallet.length>0? 
                        <div className="siww-panel">
                            <div>Please connect with a wallet</div>
                            <div className="hint">Your wallet is used to authenticate you into your dashboard.<br /><br /> Claim webApps under this wallet/identity, then configure oAuth access.</div>
                            <br />
                            <ViewWallets 
                                theme = {this.props.theme}
                                aWallet= {this.state.aWallet}
                                onSelect= {this.async_connectWallet.bind(this)}
                                fnShowMessage={() => {}}                            
                            />
                        </div>
                        : 
                        <div className="transitoryMessage">
                            {this._getActiveConnectorsAsString()}
                            <br />
                            <br />
                            Could not detect a single wallet from this browser
                        </div>
                    }
                </div>               

                {this.renderFooter()}
            </>
        );
    }
}

export default AuthLogin;
