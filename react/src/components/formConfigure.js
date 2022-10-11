import ViewFooter from "./viewFooter";
import ViewHeader from "./viewHeader";
import ViewDataShare from "./viewDataShare";
import FormReserve from "./formReserve";
import {srv_claimDomain} from "../services/configure";

const fakeIdentity = {
    username: "<user_1234567890>",
    wallet_id: "<wallet>",
    wallet_address: "<addr...>"
}

class FormConfigure extends FormReserve {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    
        this.state= Object.assign({}, this.state, {
            
            // domain
            domain_name: "",
            display_name: "",

            client_id: "",
            client_secret: "",

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
        });

    }

/*
 *          Data entry validation
 */

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

    togglePreview(event) {
        let eltPreview=document.getElementById("configuration_preview");
        eltPreview.className=this.state.isPreview? "hidden": "preview"
        this.props.fnShowMessage(this.state.isPreview? "Fill-up data and scroll down to claim domain" : "Preview of the Authentication dialog...");
        this.setState({isPreview: !this.state.isPreview});
    }

    async async_reserveDomain() {
        let dataDomain=await super.async_reserveDomain();
        if(dataDomain && dataDomain.data) {
            this.setState({domain_name: dataDomain.data.domain_name});
            this.setState({client_id: dataDomain.data.app_id});
            this.setState({client_secret: dataDomain.data.app_secret});

            this.props.fnShowMessage("Fill-up data and scroll down to claim domain");
            this.updateCanValidate();
        }
    }

    async async_claimDomain() {
        let objConfig = {
            
            // what is this domain?
            domain_name: this.state.domain_name,
            display_name: this.state.display_name,
            client_id: this.state.client_id,

            // callbacks
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

        srv_claimDomain(objConfig, this.props.AuthenticationCookieToken)
            .then(res => {
                if(res.data===null && res.message) {
                    this.props.fnShowMessage(res.message);
                }
                else {

                    // are we good here??
                }                
            })
    }

    renderPreview () {
        return (
        <div 
            id="configuration_preview"
            className="hidden"
        >
            <div id="siww-login-container" style={this.props.styles.container}>
                <div className={"modal modal-login center-vh" + (this.state.theme.webapp.dark_mode ? "dark-mode": "")} style={this.props.styles.color}>

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
                    message = {this.state.hover}
                />

                </div>

                <div 
                    className="btn btn-close btn-primary top left"
                    onClick = {this.togglePreview.bind(this)}
                >
                    Quit Preview
                </div>
                <div 
                    className="btn btn-close btn-primary bottom right"
                    onClick = {this.togglePreview.bind(this)}
                >
                    Quit Preview
                </div>
            </div>
        </div>
    )}

    renderScopes(_aScopes){
        return(
            <ul className="scopes-list">
                 {_aScopes.map((item, index) => (
                    <li className="row"
                        key={index}
                    >
                        <div className="group">
                            <span className="scope-name">Label</span>
                            <span className="scope-property">{item.label}</span>
                        </div>
                        <div className="group">
                            <span className="scope-name">Property</span>
                            <span className="scope-property">{item.property}</span>
                        </div>
                    </li>
                ))}
            </ul>
        )
        
    }

    renderFormConfigure() {

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
                        isDisabled: true,
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
                    {this.renderScopes(this.state.aScope)}

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

                    <div 
                            className={"btn btn-primary " + (this.state.canValidate? "" : "disabled")}
                            onClick = {this.async_claimDomain.bind(this)}
                        >
                            Claim domain!
                    </div>

                </div>
            </div>

        </>

        )
    }

    renderToolbar( ){
        return (
            <div className="toolbar">
                    <div 
                        className="btn btn-tiny"
                        onClick = {( )=> {this.props.onRedirect("/app")}}
                    >
                        &lt;&lt; Back to Admin panel
                    </div>        

                {this.state.domain_name===""? "" 
                :
                    <div 
                        className="btn right btn-tiny btn-primary" 
                        onClick = {this.togglePreview.bind(this)}
                    >
                        Preview
                    </div>
                }
            </div>      
        );
    }

    render() {
        return (
            <>
                {this.renderToolbar()}

                {this.state.domain_name===""? 
                    this.renderFormReserve()
                :
                    this.renderFormConfigure()
                }
            </>
        )
    }
}

export default FormConfigure;
