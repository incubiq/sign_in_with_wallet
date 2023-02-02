import AdminFormReserve from "./formDomainReserve";
import AdminFormDomainScopes from "./formDomainAuthScopes";
import AdminFormDomainLevels from "./formDomainAuthLevels";
import {srv_claimDomain, srv_updateDomain, srv_getDomainPrivateInfo} from "../../services/configure";
import WidgetDialog from "../../utils/widgetDialog"

class AdminFormConfigure extends AdminFormReserve {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    
        let _obj=this._getInitialStateObject(props);
        this.state= Object.assign({}, this.state, _obj);
    }

    resetStates(props){
        this.setState(this._getInitialStateObject(props));
    }

    _getInitialStateObject(props){
            return {
                // domain
                domain_name: this.props.domain_name? this.props.domain_name: "",    // keep this for domain creation
                display_name: null,

                app_id: this.props.app_id? this.props.app_id: null,                 // keep this for domain creation
                app_secret: null,

                // valid?
                is_claimed: false,
                is_verified: false,
                dns_token: null,
                dns_token_expires_at: null,

                // theme
                theme: props.theme,

                // config state vars
                background: "",
                logo: "",
                text_color: "",
                button_color: "",
                button_text_color: "",
                dark_mode: false,

                // oAuth 2.0 redirects
                redirect_uri: "",
                redirect_error: "",

                // localhost tunnel
                tunnel:"",

                 // 
            token_lifespan: (3*24*60*60*1000),              // 3 days

            // permission / scopes
            aScope: [{
                label: "Username",
                property: "username"
            }, {
                label: "Wallet Address",
                property: "wallet_address"
            }],

            // authorization levels
            aLevel: [{
                name: "default",
                condition: {
                    property: null,
                    operator: null,
                    value: null
                },
                connector: null                            // SIWC (Cardano), others...
            }],

            // UI / UX
            isAddAuthorization: false,
            isConfirmDialogVisible: false,
            message: ""                                         // msg displayed in Dialog..
        }            
    }

    componentDidMount() {
        super.componentDidMount();
        if(this.props.app_id) {
            this.async_initializeDomain(this.props.app_id);            
        }
    }
    
    
    componentDidUpdate(prevProps) {
        super.componentDidUpdate(prevProps);
        if(this.props.app_id!==null && this.props.app_id!==prevProps.app_id) {
            this.async_initializeDomain(this.props.app_id);            
        }
        else {
            if(this.props.app_id!==prevProps.app_id) {
                this.resetStates(this.props);
            }
        }
    }     

    async async_initializeDomain(_client_id) {
        let dataDomain=await srv_getDomainPrivateInfo(_client_id, this.props.AuthenticationCookieToken);
        if(dataDomain && dataDomain.data) {
            this.setState({
                app_id: _client_id,
                is_claimed: true,
                display_name: dataDomain.data.display_name,
                domain_name: dataDomain.data.domain_name,
                reserve_name: dataDomain.data.domain_name,      // a bit of a hack...
                redirect_uri: dataDomain.data.redirect_uri,
                token_lifespan: dataDomain.data.token_lifespan,
                is_verified: dataDomain.data.is_verified,
                dns_token: dataDomain.data.dns_token,
                dns_token_expires_at: dataDomain.data.dns_token_expires_at
            });

            if(dataDomain.data.app_secret) {
                this.setState({app_secret: dataDomain.data.app_secret});
            }
            if(dataDomain.data.redirect_error) {
                this.setState({redirect_error: dataDomain.data.redirect_error});
            }
            if(dataDomain.data.tunnel)  {
                this.setState({tunnel: dataDomain.data.tunnel});
            }
            if(dataDomain.data.a_permission_data)  {
                this.setState({aScope: dataDomain.data.a_permission_data});
            }
            if(dataDomain.data.a_authorization_level)  {
                this.setState({aLevel: dataDomain.data.a_authorization_level});
            }
            if(dataDomain.data.theme)  {
                let _objTheme=Object.assign({}, this.props.theme);
                for (const key in dataDomain.data.theme) {
                    _objTheme.webapp[key]=dataDomain.data.theme[key];
                }                
                this.setState({theme: _objTheme});
                this.setState({dark_mode: _objTheme.webapp.dark_mode});
                this.setState({text_color: _objTheme.webapp.color.text});
                this.setState({button_color: _objTheme.webapp.color.button});
                this.setState({button_text_color: _objTheme.webapp.color.button_text});

                // only set logo if not default 
                if(_objTheme.webapp.logo !=="/assets/images/logo_www.png") {
                    this.setState({logo: _objTheme.webapp.logo});
                }

                // only set background if not default 
                if(_objTheme.webapp.background !=="/assets/images/siww_background.jpg") {
                    this.setState({background: _objTheme.webapp.background});                    
                }
            }

            // set UI
            this.setState({hasUpdated: false});
            this._enableFormDomain(this.state.domain_name);
        }
    }

/*
 *          Data entry validation
 */

    validateDomainName(name) {
        if(!name) {return false}
        return name.trim().length>=2;
    }
 
    validateCallback(cb) {
        if(!cb) {return false}
        return cb.trim().length>=4;
    }

    _enableFormName(_input) {
        let isCallbackOK = this.validateCallback(this.state.redirect_uri);
        let isDomainNameOK = this.validateDomainName(_input);
        let isDomainOK = this.props.isLocalhost? this.validateUrl(this.state.domain_name)!==null :  this.validateDomain(this.state.domain_name)!==null;
        let isTunnelOK = this.props.isLocalhost? this.validateUrl(this.state.tunnel)!==null :  true;
        let _canValidate=isCallbackOK && isDomainNameOK && isDomainOK && isTunnelOK && this.state.app_id!=="";
        this.setState({canValidate: _canValidate});
    }

    _enableFormDomain(_input) {
        let isCallbackOK = this.validateCallback(this.state.redirect_uri);
        let isDomainNameOK = this.validateDomainName(this.state.display_name);
        let isDomainOK = this.props.isLocalhost? this.validateUrl(_input)!==null :  this.validateDomain(_input)!==null;
        let isTunnelOK = this.props.isLocalhost? this.validateUrl(this.state.tunnel)!==null :  true;
        let _canValidate=isCallbackOK && isDomainNameOK && isDomainOK && isTunnelOK && this.state.app_id!=="";
        this.setState({canValidate: _canValidate});
    }

    _enableFormCallback(_input) {
        let isCallbackOK = this.validateCallback(_input);
        let isDomainNameOK = this.validateDomainName(this.state.display_name);
        let isDomainOK = this.props.isLocalhost? this.validateUrl(this.state.domain_name)!==null :  this.validateDomain(this.state.domain_name)!==null;
        let isTunnelOK = this.props.isLocalhost? this.validateUrl(this.state.tunnel)!==null :  true;
        let _canValidate=isCallbackOK && isDomainNameOK && isDomainOK && isTunnelOK && this.state.app_id!=="";
        this.setState({canValidate: _canValidate});
    }

    _enableFormTunnel(_input) {
        // all other props are disabled anyway, so check oly on tunnel
        let isTunnelOK = this.props.isLocalhost? this.validateUrl(_input)!==null :  true;
        let _canValidate=isTunnelOK && this.state.app_id!=="";
        this.setState({canValidate: _canValidate});
    }

/*
 *          Reserve, claim, update domain
 */

    async async_claimDomain() {
        let objConfig = {
            
            // what is this domain?
            domain_name: this.state.domain_name,
            display_name: this.state.display_name,
            app_id: this.state.app_id,

            // callbacks
            redirect_uri: this.state.redirect_uri,
            redirect_error: this.state.redirect_error,
            
            // token
            token_lifespan:  this.state.token_lifespan,

            // datashare
            scope: this.state.aScope
        };

        // theme
        if(this.state.background!=="") {objConfig.background= this.state.background}
        if(this.state.logo!=="") {objConfig.logo= this.state.logo}

        // dev callbacks
        if(this.state.redirect_uri_dev!=="") {objConfig.redirect_uri_dev= this.state.redirect_uri_dev}
        if(this.state.redirect_error_dev!=="") {objConfig.redirect_error_dev= this.state.redirect_error_dev}

        srv_claimDomain(objConfig, this.props.AuthenticationCookieToken)
            .then(res => {
                if(res.data===null && res.message) {
                    this.props.onNotifyConfirm({
                        title: "Error",
                        message: res.message,
                        confirmFirstButtonText: "Close"
                    })
                }
                else {
                    this.setState({hasUpdated: false});     // no need to ask for confirm after this save
                    this.async_initializeDomain(this.state.app_id);
                    this.props.onNotifyClaimedDomain(this.state.app_id);
                    this.props.onNotifyConfirm({
                        title: "Confirmation",
                        message: "You have successfully claimed this domain!",
                        confirmFirstButtonText: "Close"
                    })
                }                
            })
    }

    async async_updateDomain( ) {
        let objConfig = {
            
            // which domain id?
            app_id: this.state.app_id,

            // take all that can be updated
            display_name: this.state.display_name,

            // callbacks
            redirect_uri: this.state.redirect_uri,
            redirect_error: this.state.redirect_error,
            
            // token
            token_lifespan:  this.state.token_lifespan,

            // theme 
            dark_mode: this.state.dark_mode,

            // datashare
            scope: this.state.aScope,

            // authorization levels
            levels: this.state.aLevel
        };

        if(this.props.isLocalhost) {
            objConfig.tunnel=this.state.tunnel;
        }

        if(this.state.background!=="") {objConfig.background= this.state.background}
        if(this.state.logo!=="") {objConfig.logo= this.state.logo}
        if(this.state.text_color!=="") {objConfig.text_color= this.state.text_color}
        if(this.state.button_color!=="") {objConfig.button_color= this.state.button_color}
        if(this.state.button_text_color!=="") {objConfig.button_text_color= this.state.button_text_color}

        // redirects must start with a /
        if(objConfig.redirect_uri.substring(0,1)!=="/") {objConfig.redirect_uri="/"+objConfig.redirect_uri;}
        if(objConfig.redirect_error.substring(0,1)!=="/") {objConfig.redirect_error="/"+objConfig.redirect_error;}

        srv_updateDomain(objConfig, this.props.AuthenticationCookieToken)
            .then(res => {
                if(res.data===null && res.message) {
                    this.props.onNotifyConfirm({
                        title: "Error",
                        message: res.message,
                        confirmFirstButtonText: "Close"
                    })
                }
                else {
                    this.setState({hasUpdated: false});     // no need to ask for confirm after this save
                    this.props.onNotifyUpdateDomain(this.state.app_id);
                    this.props.onNotifyConfirm({
                        title: "Confirmation",
                        message: "Domain configuration was successfully saved!",
                        confirmFirstButtonText: "Close"
                    })
                }                
            })
    }


/*
 *          Configure UI
 */

    renderFormConfigure() {

        let that=this;
        return( <>
                <div  
                    className="container"
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
                            fnValidate: function (_input) {
                                if(that.props.isLocalhost) {
                                    return that.validateUrl(_input);
                                }
                                return that.validateDomain(_input);
                            },
                            fnEnableForm: function (_input) {
                                return that._enableFormDomain(_input);
                            }
                        })}

                        {this.renderRow({
                            id: "display_name", 
                            type: "text", 
                            label: "Display name", 
                            hint: "Name of your app, as will be shown to end-users during authentication", 
                            placeholder: "My App",
                            isCompulsory: true,
                            isDisabled: that.props.isLocalhost===true,
                            fnValidate: function (_input) {
                                return that.validateDomainName(_input);
                            },
                            fnEnableForm: function (_input) {
                                return that._enableFormName(_input);
                            }
                        })}

                        {this.state.app_secret ? 
                        <>
                            <div className="category">
                                oAuth ID and Secret
                            </div>

                            {this.renderRow({
                                id: "app_id", 
                                type: "text", 
                                label: "Application ID", 
                                hint: "application ID (use it in your oAuth configuration call) ", 
                                placeholder: "",
                                isDisabled: true
                            })}

                            {this.renderRow({
                                id: "app_secret", 
                                type: "text", 
                                label: "Application Secret", 
                                hint: "application Secret (keep it safe - use it in your oAuth configuration call) ", 
                                placeholder: "",
                                isDisabled: true
                            })}

                        </>
                    :""}

                    {this.props.isLocalhost===true ? 
                        <>
                        <div className="category">
                            Localhost Tunnel
                        </div>

                        {this.renderRow({
                            id: "tunnel", 
                            type: "text", 
                            label: "Tunnel", 
                            hint: "Enter ngrok or localt tunnel URL",  
                            placeholder: "https://great-day-89.loca.lt",
                            isCompulsory: true,
                            fnValidate: function (_input) {
                                return that.validateUrl(_input);
                            },
                            fnEnableForm: function (_input) {
                                return that._enableFormTunnel(_input);
                            }
                        })}
                        </>
                    :""}

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
                            isDisabled: that.props.isLocalhost===true,
                            fnValidate: function (_input) {
                                return that.validateCallback(_input);
                            },
                            fnEnableForm: function (_input) {
                                return that._enableFormCallback(_input);
                            }
                        })}

                        {this.renderRow({
                            id: "redirect_error", 
                            type: "text", 
                            label: "Redirect Error", 
                            hint: "Redirect URI in case of oAuth error",  
                            placeholder: "/auth/siww/error",
                            isDisabled: that.props.isLocalhost===true,
                            isCompulsory: false
                        })}
                    
                        <div className="category">
                            Scopes
                        </div>

                        <AdminFormDomainScopes 
                            aScope = {this.state.aScope}
                        />

                        <div className="category">
                            <span>Authorization levels</span>
                        </div>

                        <AdminFormDomainLevels 
                            aLevel = {this.state.aLevel}
                            is_verified = {this.state.is_verified}
                            theme={this.props.theme} 
                            styles={this.props.styles}
                            onNotifyUpdateDomainLevels = {(_aLevel)=> {
                                this.setState({
                                    hasUpdated: true,
                                    aLevel: _aLevel
                                });
                            }}                        
                        />

                        <div className="category">
                            Theme
                        </div>

                        {this.props.isLocalhost===false ? 
                        <>
                        
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
                                id: "text_color", 
                                type: "text", 
                                label: "Text color", 
                                hint: "Color of texts in the Authentication form (default = #333) ", 
                                placeholder: "#333",
                                isCompulsory: false
                            })}

                            {this.renderRow({
                                id: "button_color", 
                                type: "text", 
                                label: "Button color", 
                                hint: "Color of buttons' background in the Authentication form (default = #003366) ", 
                                placeholder: "#003366",
                                isCompulsory: false
                            })}
                            
                            {this.renderRow({
                                id: "button_text_color", 
                                type: "text", 
                                label: "Button text color", 
                                hint: "Color of buttons' texts in the Authentication form (default = #f0f0f0) ", 
                                placeholder: "#f0f0f0",
                                isCompulsory: false
                            })}
                        </>
                        :
                            <div className="hint align-left">
                                Localhost does not support theme customisation
                            </div>
                        }
                        
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

                    </div>
        </>

        )
    }

    renderConfirmDialog(){
        return (
            <WidgetDialog
                title = "Discard changes?"
                message = "Please confirm you wish to exit without saving"
                version = {this.props.version}
                isVisible = {this.state.isConfirmDialogVisible}
                firstButtonText = "Exit without saving"
                secondButtonText = "Keep editing"
                onConfirm = {(_choice)=> {
                    this.setState({isConfirmDialogVisible : false});
                    if(_choice===1) {
                        this.props.onClickExit()
                    }
                }}
            />
        );
    }

    renderToolbar( ){
        return (
            <div className="toolbar">

                <div 
                    className={"btn btn-tiny right btn-primary "}
                    onClick = {( )=> {
                        // confirm??
                        if(this.state.hasUpdated) {
                            this.setState({isConfirmDialogVisible : true});
                        }
                        else {
                            this.props.onClickExit()
                        }
                    }}
                >                                
                    ❌ Exit
                </div>
            

                {this.state.is_claimed ?
                    <div 
                        className={"btn btn-tiny right btn-primary " + (this.state.canValidate && this.state.hasUpdated? "" : "disabled")}
                        onClick = {this.async_updateDomain.bind(this)}
                    >                                
                        💾 Save Config
                    </div>
                :            
                    <div 
                            className={"btn btn-tiny right  btn-primary " + (this.state.canValidate? "" : "disabled")}
                            onClick = {this.async_claimDomain.bind(this)}
                        >                                
                       🌐 Claim this domain
                    </div>
                }
                
            </div>      
        );
    }

    render() {
        return (
            <>
                {this.renderToolbar()}
                {this.renderConfirmDialog()}
                {this.renderFormConfigure()}
            </>
        )
    }
}

export default AdminFormConfigure;
