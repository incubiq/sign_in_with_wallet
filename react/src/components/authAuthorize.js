import AuthAuthenticate from "./authAuthenticate";
import ViewHeader from "./viewHeader";
import ViewDataShare from "./viewDataShare";
import ViewIdentities from "./viewIdentities";
import FormAuthorize from "./formAuthorize";

import {srv_verify} from "../services/authenticate";
import {getMyIdentities, grantAccessToWebApp, revokeAccessToWebApp, isGrantedAccessToWebApp} from "../services/me";
import {CRITICALITY_LOW, CRITICALITY_NORMAL, CRITICALITY_SEVERE} from "../const/message";

const VIEWMODE_IDENTITY="identity";
const VIEWMODE_DATASHARE="datashare";

// class used for authorizing a user via oauth

class AuthAuthorize extends AuthAuthenticate {

/*
 *          inits
 */

    constructor(props) {
        super(props);    

        this.state= Object.assign({}, this.state, {
            isAuthorized: false,
            aScope: [],
            viewMode: VIEWMODE_DATASHARE
        });        
    }

    componentDidMount() {
        super.componentDidMount();
    }

    componentDidUpdate(prevProps) {
        super.componentDidUpdate(prevProps);

        // see when we can init the scopes...
        if(this.props.webApp!==null && this.state.aScope.length===0) {
            this.setState({aScope: this.props.webApp.aScope});
            this.setState({aIdentity: getMyIdentities()});
        }
    }     

/*
 *          Authentication
 */

    authenticateUser(aIdentity, iUser) {
        super.authenticateUser(aIdentity, iUser);

        // update authorization data
        this.updateDatashare(aIdentity, iUser);
        this.setState({viewMode: VIEWMODE_DATASHARE});

        // did we grant authorization before?
        if(isGrantedAccessToWebApp(aIdentity[iUser].username, this.props.webAppId)) {
            this.authorizeDataShare(aIdentity[iUser].username);
        }
    }

/*
 *          Authorization
 */

    async async_requestAuthorization(_username) {

        // this is where we ask for a message signature
        let cose=await this.async_signMessage(this.state.aIdentity[this.state.iSelectedIdentity].wallet_id, this.props.webAppDomain);
        if(cose) {
            // todo verify cose signature with backend
            cose.connector=this.state.aIdentity[this.state.iSelectedIdentity].connector;
            let dataVerified=await srv_verify(cose);
            if(dataVerified && dataVerified.data && dataVerified.data.isVerified) {
                // now grant access
                grantAccessToWebApp(_username, this.props.webAppId);
                this.authorizeDataShare(_username);
            }
            else {
                this.setState({hover:"Authentication refused by server"});
                this.setState({criticality:CRITICALITY_SEVERE});    
            }
        }
        else {
            // 
            this.setState({hover:"Authentication refused by wallet"});
            this.setState({criticality:CRITICALITY_SEVERE});
        }
    }

    // calling this will move the UI to the redirection section (final step)
    authorizeDataShare(_username) {
        
        // set granting to local storage and refresh what we know about user
        this.setState({aIdentity: getMyIdentities()});

        this.setState({isAuthorized: true});
        this.setState({hover:"Redirecting..."});
        this.setState({inTimerEffect: true});
    }

    // update the data shared based on known scope and selected identity
    updateDatashare(_aIdentity, _iSel) {
        if(_iSel!==-1 && _aIdentity.length>0) {
            let _aScope=this.state.aScope.slice();
            _aScope.forEach(item => {
                let _value=_aIdentity[_iSel][item.property]
                item.value=_value;
            });
            this.setState({aScope: _aScope});
        }
    }

/*
 *          UI (authorization)
 */
    
    onChangeIdentity(_id) {
        let _iSel=this.state.aIdentity.findIndex(function (x) {return x.wallet_id===_id});
        
        // css 
        let aEltId=document.getElementsByClassName("wallet-sign");
        for(var i=0; i<aEltId.length; i++) {
            if(i===_iSel) {
                aEltId[i].className="wallet-sign connected selected";
            }
            else {
                aEltId[i].className ="wallet-sign connected";
            }
        }


        this.setSharedIdentity(this.state.aIdentity, _iSel);
        this.updateDatashare(this.state.aIdentity, _iSel);
        this.onToggleAuthorizationView();
    }

    onBackToAddIdentity() {
        this.setState({iSelectedIdentity: null});
        this.setState({inTimerEffect: false})
        this.setState({hover: "&nbsp;"})
    }

    onToggleAuthorizationView() {
        if(this.state.viewMode===VIEWMODE_DATASHARE) {
            this.setState({viewMode: VIEWMODE_IDENTITY});
        }
        else {
            this.setState({viewMode: VIEWMODE_DATASHARE});
        }
    }

    onReAuthenticate ( ){
        // todo
        this.props.onRedirect("/auth/"+this.props.chain+"?app_id=" + this.props.webAppId);
    }
    
    renderAuthorization() {
        return(
            <>
            {this.state.aScope.length>0? 
                <>
                {this.state.aIdentity.length>0?
                    <div className={"siww-panel " + (this.state.theme.webapp.dark_mode ? "dark-mode": "")}>

                        {this.state.viewMode===VIEWMODE_DATASHARE? 
                            <ViewDataShare 
                                theme = {this.state.theme}
                                oauthClientName = {this.props.webAppName}
                                iSelectedIdentity = {this.state.iSelectedIdentity}
                                aIdentity = {this.state.aIdentity}
                                aScope = {this.state.aScope}
                            />
                        : 
                            <ViewIdentities 
                                theme = {this.state.theme}
                                iSelectedIdentity = {this.state.iSelectedIdentity}
                                aIdentity = {this.state.aIdentity}
                                onHover = {this.onHover.bind(this)}
                                onSelect= {this.onChangeIdentity.bind(this)}
                            />
                        }

                        <div className="identity_action">

                            {this.state.viewMode===VIEWMODE_DATASHARE && this.state.aIdentity.length>1 ? 
                                <div 
                                    className="btn btn-transparent actionLink back"
                                    onClick={evt => {this.onToggleAuthorizationView();}}
                                >
                                    Switch Identity!
                                </div>                            
                            : 
                                <div 
                                    className="btn btn-transparent actionLink back"
                                    onClick={evt => {this.onBackToAddIdentity(evt);}}
                                >
                                    Back to wallets!
                                </div>
                            }   

                            <button 
                                className="btn btn-quiet"
                                onClick={evt => {
                                    this.async_requestAuthorization(this.state.aIdentity[this.state.iSelectedIdentity].username);
                                }}
                            >
                                Grant Access!
                            </button>
                        </div>
                    </div>                
                : 
                <div className={"siww-panel " + (this.state.theme.webapp.dark_mode ? "dark-mode": "")}>
                    <div className="siww-oauth-login">
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
            </>                    
            : 
            <div className={"siww-panel " + (this.state.theme.webapp.dark_mode ? "dark-mode": "")}>
                <div className="siww-oauth-login">
                    This application has not defined any data autorization.
                    < br/>
                    Their fault, not yours! 
                    < br/>
                    Cannot grant access with no minimum ID to share...
                </div>
            </div>
            }
            </>  
        )
    }

/*
 *          UI redirect
 */

    doLogin ( ){
        let eltForm=document.getElementById('form-login');
        if(eltForm) {
            document.cookie = this.props.AuthenticationCookieName + "=" + this.state.token + ";path=/";
            document.getElementById('form-login').submit();
        }
    }

    doRevokeAccess ( ){
        this.setState({isAuthorized: false});

        // revoke access, store, and refresh what we know about user
        revokeAccessToWebApp(this.state.username, this.props.webAppId);
        this.setState({aIdentity: getMyIdentities()});
        this.setState({inTimerEffect: false});
        this.setState({hover: "Revoked access, please grant the access again to authenticate"});
    }

    renderRedirect() {

        return (
            <>
                <div className={"siww-panel " + (this.state.theme.webapp.dark_mode ? "dark-mode": "")}>
                    <div className="siww_message">
                        <div id="idRedirectMessage" className="transitoryMessage">
                            On your way to {this.props.webAppName}...
                        </div>

                        <span>Stay safe online with {this.state.theme.name}</span>
                        <div className="separator"></div>                        
                    </div>

                    <div className="separator"></div>         

                    <FormAuthorize 
                        theme = {this.state.theme}
                        app_id = {this.props.webAppId}
                        aScope = {this.state.aScope}
                        onContinue = {this.doLogin.bind(this)}
                        onRevokeAccess = {this.doRevokeAccess.bind(this)}
                    />
                </div>

            </>
        )
    }

/*
 *          UI generic
 */
    
    callbackEffect () {
        // which case of callback are we in??
        if(this.state.isAuthorized) {
            this.doLogin()
        }
    }

    render() {
        return (
            <div id="siww-login-container" style={this.props.styles.container}>
                <div className={"modal modal-login center-vh" + (this.state.theme.webapp.dark_mode ? "dark-mode": "")} style={this.props.styles.color}>

                    <ViewHeader 
                        app_id= {this.props.webAppId}
                        oauthClientName = {this.props.webAppName}
                        oauthDomain = {this.props.webAppDomain}
                        is_verified = {this.props.webApp!=null && this.props.webApp.isVerified===true}
                        isOauth = {true}
                        SIWWLogo = {this.state.theme.logo}
                        theme = {this.state.theme}
                    />

                    {this.state.iSelectedIdentity!==null ? 
                        this.state.isAuthorized? 
                            this.renderRedirect() 
                        :
                            this.renderAuthorization() 
                        : 
                            this.renderAuthentication()
                    }

                    {this.renderFooter()}

                </div>
        </div>
        )
    }
}

export default AuthAuthorize;
