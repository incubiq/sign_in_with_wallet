import AppAuthenticate from "./appAuthenticate";
import AppAuthHeader from "./appAuthHeader";
import AppAuthFooter from "./appAuthFooter";

class AppAuthorize extends AppAuthenticate {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    

    }

/*
 *          Store user info
 */


/*
 *          UI
 */

    render() {
        let objStyles=this.getStyles();
        return(
            <div id="siwc-login-container" style={objStyles.container}>
                <div className={"modal-login center-vh" + (this.state.theme.dark_mode ? "dark-mode": "")} style={objStyles.color}>

                    <AppAuthHeader 
                        client_id= {this.state.client_id}
                        oauthClientName = {this.state.oauthClientName}
                        oauthDomain = {this.state.oauthDomain}
                        isOauth = {true}
                        SIWCLogo = "/assets/images/siwc_logo.png"
                        theme = {this.state.theme}
                    />

                                        
                    <div className={"login-line login-line-emph" + (this.state.theme.dark_mode ? "dark-mode": "")}>
                        <div >
                            <strong>{this.state.oauthClientName}</strong> is requesting access to the following data from your wallet:
                        </div>



                    </div>

                    <AppAuthFooter 
                        theme = {this.state.theme}
                    />

                </div>
            </div>
        )
    }
}

export default AppAuthorize;
