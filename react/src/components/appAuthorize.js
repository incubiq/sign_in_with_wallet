import AppAuthenticate from "./appAuthenticate";
import AppAuthHeader from "./appAuthHeader";
import AppAuthFooter from "./appAuthFooter";

import {registerWebAppWithIdentity, getMyIdentities} from "../services/me";

class AppAuthorize extends AppAuthenticate {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    

        let scope=decodeURIComponent(decodeURIComponent(this.getmyuri("scope", window.location.search)));
        let aScope=JSON.parse(scope);
        let aId=getMyIdentities();
        
        // make sure WebApp is registered for each known identity of this user...
        aId.forEach(item=> {
            registerWebAppWithIdentity(item.username, {
                client_id: this.state.client_id,
                scope: aScope
            });    
        })

        this.state= Object.assign({}, this.state, {
            aScope: aScope,
            aIdentity: aId,
            iSelectedIdentity: 0
        });
    }

/*
 *          Store user info
 */

    onSIWCNotify_WalletsAccessible(_aWallet) {
        super.onSIWCNotify_WalletsAccessible(_aWallet);
        
        // update known identities...
        let aId=getMyIdentities();
        this.setState({aIdentity: aId});
    }

    async async_onAuthCookieReceived(cookie) {
        await super.async_onAuthCookieReceived(cookie);

        // update known identities...
        let aId=getMyIdentities();
        this.setState({aIdentity: aId});
    }

/*
 *          UI
 */

    getCondensedText(_str) {
        if(!_str) {return "";}
        if(_str.length<=10) return _str;
        return _str.substring(0,10)+"...";
    }

    onReAuthenticate ( ){
        this.props.onRedirect("/app/authenticate?client_id=" + this.state.client_id+"&domain="+this.state.oauthDomain+"&name="+this.state.oauthClientName);
    }

    onChangeIdentity(event)  {

    }

    render() {
        return(
            <div id="siwc-login-container" style={this.state.styles.container}>
                <div className={"modal-login center-vh" + (this.state.theme.dark_mode ? "dark-mode": "")} style={this.state.styles.color}>

                    <AppAuthHeader 
                        client_id= {this.state.client_id}
                        oauthClientName = {this.state.oauthClientName}
                        oauthDomain = {this.state.oauthDomain}
                        isOauth = {true}
                        SIWCLogo = "/assets/images/siwc_logo.png"
                        theme = {this.state.theme}
                    />

                    {this.state.aIdentity.length>0?
                        <div className={"login-line login-line-emph" + (this.state.theme.dark_mode ? "dark-mode": "")}>

                            <div className="siwc-oauth-section">
                                <strong>{this.state.oauthClientName}</strong> is requesting access to those data:
                            </div>

                            <ul className="scopes-list">
                                {this.state.aScope.map((item, index) => (  
                                    <li key={index}>
                                        <span className="scope-name">{item.text}</span>
                                        <span className={"scope-value "+item.value} id={"scope_"+item.value}>
                                            { this.getCondensedText(this.state.aIdentity[this.state.iSelectedIdentity][item.value]) }
                                        </span>
                                    </li>
                                ))}
                            </ul>


                            <div className="siwc-oauth-section">
                                Select identity to grant data share from:
                            </div>

                            {this.renderWalletSelection(this.state.aIdentity, this.state.iSelectedIdentity)}

                            <div className="identity_action">
                                <button 
                                    className="btn btn-quiet"
                                    onClick={evt => {
                                    }}
                                >
                                    Add identities...
                                </button>

                                <button 
                                    className="btn btn-quiet"
                                    onClick={evt => {
                                    }}
                                >
                                    Grant Access!
                                </button>
                            </div>

                        </div>                
                    : 
                    <div className={"login-line login-line-emph" + (this.state.theme.dark_mode ? "dark-mode": "")}>
                        <div className="siwc-oauth-login">
                            Who are you? Cannot find your identity...
                        </div>
                        <br />
                        <button 
                            className="btn btn-quiet"
                            onClick={evt => {
                                this.onReAuthenticate(evt); 
                            }}
                        >
                            Re-Authenticate!
                        </button>
                    </div>
                    }
                    <AppAuthFooter 
                        theme = {this.state.theme}
                    />

                </div>
            </div>
        )
    }
}

export default AppAuthorize;
