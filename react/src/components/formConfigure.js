import {Component} from "react";
import ViewHeader from "./viewHeader";
import ViewFooter from "./viewFooter";
import ViewDataShare from "./viewDataShare";
import {srv_reserveDomain, srv_claimDomain} from "../services/configure";

const fakeIdentity = {
    username: "<user_1234567890>",
    wallet_id: "<wallet>",
    wallet_address: "<addr...>"
}

class FormConfigure extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    
        this.state={
            
            // domain
            domain_name: "",
            display_name: "",

            // theme
            theme: this.props.theme,
            background: "",
            logo: "",

            // oAuth 2.0 redirects
            redirect_uri: "",
            redirect_error: "",
            redirect_uri_dev: "",
            redirect_error_dev: "",

            // 
            token_lifespan: (3*24*60*60*1000),              // 3 days

            aScope: [{
                label: "Username",
                property: "username"
            }, {
                label: "Wallet address",
                property: "wallet_address"
            }],

            // UI / UX
            isPreview: false,
            canValidate: false,
            msgPreview: "Preview of the Authentication dialog..."
        }
    }

/*
 *          Data entry validation
 */

    validateDomain(url) {
        //remove all http:// or https:// in front...
        url = url.toLowerCase();
        if (url.substr(0, 7) === "http://") {
            url = url.substr(7, url.length);
        } else {
            if (url.substr(0, 8) === "https://") {
                url = url.substr(8, url.length);
            }
        }

        var re = new RegExp(/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/);
        if (url.match(re) || url === "localhost") {
            if (url.split(".").length-1 === 1) {
                return url;
            }
        }
        return null;
    }

    validateDomainName(name) {
        return name.trim().length>=2;
    }
 
    validateCallback(cb) {
        return cb.trim().length>=4;
    }

    updateCanValidate() {
        let isCallbackOK = this.validateCallback(this.state.redirect_uri);
        let isDomainNameOK = this.validateDomainName(this.state.domain_name);
        let isDomainOK = this.validateDomain(this.state.domain_name)!==null;
        this.setState({canValidate: isCallbackOK && isDomainNameOK && isDomainOK});
    }

/*
 *          UI
 */

    showPreview(event) {
        let eltPreview=document.getElementById("configuration_preview");
        eltPreview.className=this.state.isPreview? "hidden": "preview"
        this.setState({isPreview: !this.state.isPreview});
    }

    claimDomain() {
        let objConfig = {
            
            // what is this domain?
            domain_name: this.state.domain_name,
            display_name: this.state.display_name,

            // callbacks
            use_dev_uri: true,          // todo ????            
            redirect_uri: this.state.redirect_uri,
            redirect_error: this.state.redirect_error,
            
            // token
            token_lifespan:  this.state.token_lifespan,

            // datashare
            scope: this.state.aScope
        };

        if(this.state.background!=="") {objConfig.background= this.state.background}
        if(this.state.logo!=="") {objConfig.logo= this.state.logo}
        if(this.state.redirect_uri_dev!=="") {objConfig.redirect_uri_dev= this.state.redirect_uri_dev}
        if(this.state.redirect_error_dev!=="") {objConfig.redirect_error_dev= this.state.redirect_error_dev}

        srv_reserveDomain(objConfig)
            .then(res => {
                
            })
    }

    renderPreview () {
        return (
        <div 
            id="configuration_preview"
            className="hidden"
        >
            <div id="siww-login-container" style={this.props.styles.container}>
                <div className={"modal-login center-vh" + (this.state.theme.webapp.dark_mode ? "dark-mode": "")} style={this.props.styles.color}>

                <ViewHeader 
                    client_id= {null}
                    oauthClientName = {this.state.display_name}
                    oauthDomain = {this.state.domain_name}
                    isOauth = {true}
                    SIWWLogo = {this.state.theme.logo}
                    theme = {this.state.theme}
                />

                <div className="siww-panel">
                    <ViewDataShare 
                        theme = {this.state.theme}
                        oauthClientName = {this.state.display_name}
                        iSelectedIdentity = {0}
                        aIdentity = {[fakeIdentity]}
                        aScope = {this.state.aScope}
                    />                            

                    <div className="identity_action">
                        <div className="btn btn-transparent actionLink back">
                            Switch Identity!
                        </div>                            

                        <div className="btn btn-quiet">
                            Grant Access!
                        </div>
                    </div>
                </div>

                <ViewFooter 
                    version={this.props.version}
                    theme = {this.state.theme}
                    message = {this.state.msgPreview}
                />

                </div>

                <div 
                    className="btn btn-close btn-primary top left"
                    onClick = {this.showPreview.bind(this)}
                >
                    Quit Preview
                </div>
                <div 
                    className="btn btn-close btn-primary bottom right"
                    onClick = {this.showPreview.bind(this)}
                >
                    Quit Preview
                </div>
            </div>
        </div>
    )}

    renderRow(objParam)  {
        let that=this;
        return (
            <div className={"row"  +(objParam.isCompulsory===true ? " compulsory" : "") }>
                <div
                    className="label"
                >{objParam.label}</div>

                <img
                    id={"icon_"+objParam.id} 
                    className="icon"
                    src="./assets/images/icon_compulsory.png"
                />

                <input 
                    type={objParam.type} 
                    className="value "
                    id={objParam.id} 
                    value={that.state[objParam.id]}
                    placeholder = {objParam.placeholder}
                    onChange={(e) => {
                        let _eltIcon=document.getElementById("icon_"+objParam.id);
                        let _defOnchange=function(_e) {
                            let _obj={};
                            _obj[objParam.id] = _e.target.value;
                            that.setState(_obj);
                            if(_e.target.value!=="") {
                                let _isValid=objParam.fnValidate(_e.target.value);
                                _eltIcon.src=_isValid? "./assets/images/icon_check.png" : "./assets/images/icon_warning.png"
                            }
                            else {
                                _eltIcon.src="./assets/images/icon_compulsory.png"
                            }
                        }

                        objParam.onChange? objParam.onChange(e) : _defOnchange(e)
                    }}
                />

                <div
                    className="hint"
                >
                    {objParam.hint}
                </div>
            </div>
        )
    }

    render() {

        let that=this;
        return( <>
            <div className="siww_configure-body">
                <div  
                    className="siww_configure"
                    id="form-configure"
                >

                    <div className="category">
                        Application's domain
                    </div>

                    {this.renderRow({
                        id: "domain_name", 
                        type: "text", 
                        label: "Domain", 
                        hint: "The domain name of your web app", 
                        placeholder: "mydomain.com",
                        isCompulsory: true,
                        fnValidate: function (_input) {that.updateCanValidate( ); return that.validateDomain(_input);}
                    })}

                    {this.renderRow({
                        id: "display_name", 
                        type: "text", 
                        label: "Display name", 
                        hint: "Name of your app, as will be shown to end-users during authentication", 
                        placeholder: "My App",
                        isCompulsory: true,
                        fnValidate: function (_input) {that.updateCanValidate( ); return that.validateDomainName(_input);}
                    })}

                    <div className="category">
                        oAuth 2.0 callbacks
                    </div>

                    {this.renderRow({
                        id: "redirect_uri", 
                        type: "text", 
                        label: "Redirect URI", 
                        hint: "Redirect URI for the oAuth callback", 
                        placeholder: "/auth/siww/callback",
                        isCompulsory: true,
                        fnValidate: function (_input) {that.updateCanValidate( ); return that.validateCallback(_input);}
                    })}

                    {this.renderRow({
                        id: "redirect_error", 
                        type: "text", 
                        label: "Redirect Error", 
                        hint: "Redirect URI in case of oAuth error",  
                        placeholder: "/auth/siww/error",
                        isCompulsory: false
                    })}

                    <div className="category">
                        Scopes
                    </div>

                    <div className="category">
                        Theme
                    </div>

                    {this.renderRow({
                        id: "background", 
                        type: "text", 
                        label: "Background", 
                        hint: "URL of a background image for branding the authentication page", 
                        placeholder: "https://mydomain.com/background.jpg",
                        isCompulsory: false
                    })}

                    {this.renderRow({
                        id: "logo", 
                        type: "text", 
                        label: "Logo", 
                        hint: "Logo of your web app, as will be shown to end-users during authentication", 
                        placeholder: "https://mydomain.com/logo_256x256.jpg",
                        isCompulsory: false
                    })}

                    {this.renderRow({
                        id: "color_text", 
                        type: "text", 
                        label: "Text color", 
                        hint: "Color of texts in the Authentication form (default = #333) ", 
                        placeholder: "#333",
                        isCompulsory: false
                    })}

                    {this.renderRow({
                        id: "color_button", 
                        type: "text", 
                        label: "Button color", 
                        hint: "Color of buttons' background in the Authentication form (default = #003366) ", 
                        placeholder: "#003366",
                        isCompulsory: false
                    })}
                    
                    {this.renderRow({
                        id: "color_button_text", 
                        type: "text", 
                        label: "Button text color", 
                        hint: "Color of buttons' texts in the Authentication form (default = #f0f0f0) ", 
                        placeholder: "#f0f0f0",
                        isCompulsory: false
                    })}
                    
{/*
                    {this.renderRow({
                        id: "redirect_uri_dev", 
                        type: "text", 
                        label: "Redir. URI (dev)", 
                        hint: "Redirect URI for the oAuth callback (when in dev/test mode)", 
                        placeholder: "/auth/siww/callback"
                    })}

                    {this.renderRow({
                        id: "redirect_error_dev", 
                        type: "text", 
                        label: "Redir. Error (dev)", 
                        hint: "Redirect URI in case of oAuth error (when in dev/test mode)", 
                        placeholder: "/auth/siww/error"
                    })}

                    <div className="category">
                        Secrets
                    </div>

                    {this.renderRow({
                        id: "token_lifespan", 
                        type: "number", 
                        label: "Token lifespan", 
                        hint: "Duration of SIWW cookie in seconds (259,200 secs = 3 days by default)", 
                        placeholder: "",
                        onChange: function(e) {
                            that.setState({token_lifespan : parseInt(e.target.value)});
                        }
                    })}
*/}
                    {this.renderPreview()}
                </div>
            </div>

            <div
                className="siww_configure-footer" 
                > 
                <div 
                    className="btn btn-quiet" 
                    onClick = {this.showPreview.bind(this)}
                >
                    Preview
                </div>

                <div 
                    className={"btn btn-quiet " + (this.state.canValidate? "" : "disabled")}
                    onClick = {this.claimDomain.bind(this)}
                >
                    Claim domain!
                </div>

            </div>
        </>
/*

// token
token_lifespan:  3*24*60*60*1000,  // 3 day default
scope: _getScopes()
*/

        )
    }
}

export default FormConfigure;
