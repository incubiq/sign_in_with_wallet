import ViewFooter from "./viewFooter";
import ViewHeader from "./viewHeader";
import ViewDataShare from "./viewDataShare";
import FormReserve from "./formReserve";
import DialogOwnership from "./dialogOwnership"
import {getSupportedConnectors, getConnectorDisplayName} from "../assets/themes/all"; 
import {getAuthorizationCondition, getAuthorizationConditions, getAuthorizationOperator, getAuthorizationOperators} from "../const/authorization"; 
import {srv_claimDomain, srv_updateDomain, srv_getDomainPrivateInfo, srv_renewDNS, srv_verifyDNS} from "../services/configure";
import {getDefault} from "../const/connectors"; 

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
            domain_name: props.domain_name? props.domain_name : "",
            display_name: "",

            app_id: props.app_id? props.app_id : "",
            app_secret: props.app_secret? props.app_secret : "",

            // valid?
            is_verified: false,
            dns_token: null,
            dns_token_expires_at: null,

            // theme
            theme: this.props.theme,

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
            aConnectors: getSupportedConnectors().aConnector,
            curConditionName: "",
            curConditionConnector: "SIWC",
            curConditionProperty: "",
            curConditionOperator: "",
            curConditionValue: "",

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
            isPreview: false,
            isAddAuthorization: false,
            isDialogOwnershipVisible: false,
            message: ""                                         // msg displayed in Dialog..
        });

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
    }     

    async async_initializeDomain(_client_id) {
        let dataDomain=await srv_getDomainPrivateInfo(_client_id, this.props.AuthenticationCookieToken);
        if(dataDomain && dataDomain.data) {
            this.setState({app_id: _client_id});
            this.setState({display_name: dataDomain.data.display_name});
            this.setState({domain_name: dataDomain.data.domain_name});
            this.setState({redirect_uri: dataDomain.data.redirect_uri});
            this.setState({token_lifespan: dataDomain.data.token_lifespan});

            this.setState({is_verified: dataDomain.data.is_verified});
            this.setState({dns_token: dataDomain.data.dns_token});
            this.setState({dns_token_expires_at: dataDomain.data.dns_token_expires_at});

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
                let _objTheme=Object.assign({}, this.state.theme);
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
        this.setState({canValidate: isCallbackOK && isDomainNameOK && isDomainOK && isTunnelOK && this.state.app_id!==""});
    }

    _enableFormDomain(_input) {
        let isCallbackOK = this.validateCallback(this.state.redirect_uri);
        let isDomainNameOK = this.validateDomainName(this.state.display_name);
        let isDomainOK = this.props.isLocalhost? this.validateUrl(_input)!==null :  this.validateDomain(_input)!==null;
        let isTunnelOK = this.props.isLocalhost? this.validateUrl(this.state.tunnel)!==null :  true;
        this.setState({canValidate: isCallbackOK && isDomainNameOK && isDomainOK && isTunnelOK && this.state.app_id!==""});
    }

    _enableFormCallback(_input) {
        let isCallbackOK = this.validateCallback(_input);
        let isDomainNameOK = this.validateDomainName(this.state.display_name);
        let isDomainOK = this.props.isLocalhost? this.validateUrl(this.state.domain_name)!==null :  this.validateDomain(this.state.domain_name)!==null;
        let isTunnelOK = this.props.isLocalhost? this.validateUrl(this.state.tunnel)!==null :  true;
        this.setState({canValidate: isCallbackOK && isDomainNameOK && isDomainOK && isTunnelOK && this.state.app_id!==""});
    }

    _enableFormTunnel(_input) {
        // all other props are disabled anyway, so check oly on tunnel
        let isTunnelOK = this.props.isLocalhost? this.validateUrl(_input)!==null :  true;
        this.setState({canValidate: isTunnelOK && this.state.app_id!==""});
    }

/*
 *          UI
 */

    togglePreview(event) {
        let eltPreview=document.getElementById("configuration_preview");
        eltPreview.className=this.state.isPreview? "hidden": "preview"
        this.props.fnShowMessage({
            message: (this.state.isPreview) ? "Fill-up data and scroll down to claim domain" : "Preview of the Authentication dialog..."
        });
        this.setState({isPreview: !this.state.isPreview});
    }

    async async_reserveDomain() {
        let dataDomain=await super.async_reserveDomain();
        if(dataDomain && dataDomain.data) {
            this.setState({domain_name: dataDomain.data.domain_name});
            this.setState({app_id: dataDomain.data.app_id});

            this.props.fnShowMessage({message: "Fill-up data and scroll down to claim domain"});
            this._enableFormDomain(dataDomain.data.domain_name);
        }
    }

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
                    this.props.fnShowMessage({message: res.message});
                }
                else {
                    // we are good here
                    this.props.onRedirect("/app")
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
                    this.props.fnShowMessage({message: res.message});
                }
                else {
                    this.props.onRedirect("/app")
                }                
            })
    }

    async async_renewDomain() {
        let dataDomain=await srv_renewDNS(this.state.app_id, this.props.AuthenticationCookieToken);
        if(dataDomain && dataDomain.data && dataDomain.data.dns_token) {
            this.setState({dns_token: dataDomain.data.dns_token});
            this.setState({message: "Validate this DNS record to prove ownership"});
            this.setState({isDialogOwnershipVisible: true})    
        }
    }

    async async_verifyDomain() {
        let dataDomain=await srv_verifyDNS(this.state.app_id, this.props.AuthenticationCookieToken);
        if(dataDomain && dataDomain.data) {
            this.setState({is_verified: dataDomain.data.is_verified===true});

            if(dataDomain.data.is_verified) {
                this.setState({isDialogOwnershipVisible: false});
            }
            else {
                this.setState({message: "Could not verify, please check your DNS!"});
            }
        }
    }

    toggleAddAuthorization(event) {
        let eltDlg=document.getElementById("configuration_addAuthorization");
        eltDlg.className=this.state.isAddAuthorization? "hidden": "addAuthorization"

        // closing the dialog?
        if(this.state.isAddAuthorization) {
            this.setState({curConditionConnector : ""});        // need this to refresh select of all props
        }
        else {
            // default condition at start of dialog
            this.setState({curConditionName : ""})
            this.setState({curConditionConnector : "SIWC"})
            let defaultCondition=getAuthorizationConditions("SIWC")[0];
            this.setState({curConditionProperty : defaultCondition.property})
            this.setState({curConditionOperator : defaultCondition.default})
            this.setState({curConditionValue : ""})
        }


        // show / hide dialog
        this.setState({isAddAuthorization: !this.state.isAddAuthorization});
    }

    addAuthorization() {
        // Add this authorization condition?
        if(this.canAddAuthorization({
            name: this.state.curConditionName,
            value: this.state.curConditionValue
        })) {
            let aCond=this.state.aLevel;
            aCond.push({
                name: this.state.curConditionName,
                connector: this.state.curConditionConnector,
                condition: {
                    property: this.state.curConditionProperty,
                    operator: this.state.curConditionOperator,
                    value: this.state.curConditionValue
                }
            });
            this.setState({aLevel: aCond});

        }
        this.toggleAddAuthorization();
    }

    removeAuthorization (_event) {
        let _name=_event.currentTarget.dataset? _event.currentTarget.dataset.name : null;
        let aCond=[];
        this.state.aLevel.forEach(item => {
            if(item.name!==_name) {
                aCond.push(item);
            }
        });
        this.setState({aLevel: aCond});
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
                    app_id= {null}
                    oauthClientName = {this.state.display_name}
                    oauthDomain = {this.state.domain_name}
                    isOauth = {true}
                    theme = {this.state.theme}
                    aConnector = {null}
                    connector = {{assets: getDefault()}}
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
            <ul className="row-list">
                 {_aScopes.map((item, index) => (
                    <li className="row"
                        key={index}
                    >
                        <div className="group">
                            <span className="row-name">Label</span>
                            <span className="row-property">{item.label}</span>
                        </div>
                        <div className="group">
                            <span className="row-name">Property</span>
                            <span className="row-property">{item.property}</span>
                        </div>
                    </li>
                ))}
            </ul>
        )        
    }

    canAddAuthorization(objParam) {

        // make sure we have a name 
        if((objParam.name===null || objParam.name==="")) {
            return false
        }

        // make sure name is not a duplicate
        let bFound=false;
        this.state.aLevel.forEach(item => {
            if(item.name===objParam.name) {bFound=true}
        });
        if(bFound) {
            return false;
        }

        // make sure we have a condition value
        if((objParam.value===null || objParam.value==="")) {
            return false;
        }

        return true;
    }

    _validateAuthorization(objParam) {
        let eltBtn=document.getElementById("btnAddAuthorization");
        if(this.canAddAuthorization(objParam)) {
            eltBtn.classList.remove("disabled");
        }
        else {
            eltBtn.classList.add("disabled");
        }
    }

    renderAuthorizationDialog() {
        return (<div 
            id="configuration_addAuthorization"
            className="hidden"
        >
            <div className="modalContainer blur"></div>
            <div className={"modal center-vh" + (this.state.theme.webapp.dark_mode ? "dark-mode": "")} style={this.props.styles.color}>
                <div className="siww-header">
                    <span>Add an Authorization level</span>
                </div>

                <div className="">
                    <ul className="row-list">            
                        <li className="row">
                            <span className="label">Name</span>
                            <input 
                                type="text" 
                                className="value"
                                value = {this.state.curConditionName}
                                id="configuration_addAuthorization_name" 
                                placeholder = "Enter a meaningful name"
                                onChange={(_event) => {
                                    this.setState({curConditionName : _event.target.value});
                                    this._validateAuthorization({
                                        name: _event.target.value,
                                        value: this.state.curConditionValue
                                    });
                                }}
                            />
                            <div className="hint align-left">
                                If the condition triggers, your app receives this level name with the shared data 
                            </div>
                        </li>

                        <li className="row">
                            <span className="label">Connector</span>
                            <select 
                                id="configuration_addAuthorization_connector" 
                                onChange={(_event) => {
                                    this.setState({curConditionConnector : _event.target.value});
                                    this._validateAuthorization({
                                        name: this.state.curConditionName,
                                        value: this.state.curConditionValue
                                    });
                                }}
                            >
                                {this.state.aConnectors.map((item, index) => (
                                    <option value={item} key={index}>{getConnectorDisplayName(item)}</option>
                                ))}

                            </select>
                            <div className="hint align-left">
                                This authorization level only triggers with this connector
                            </div>
                        </li>

                        <li className="row">
                            <select 
                                    id="configuration_addAuthorization_conditionProperty" 
                                    defaultValue={this.state.curConditionProperty}
                                    onChange={(_event) => {
                                        this.setState({curConditionProperty : _event.target.value});
                                        this.setState({curConditionOperator : getAuthorizationCondition(_event.target.value).default});
                                    }}
                                >
                                    {getAuthorizationConditions(this.state.curConditionConnector).map((item, index) => (
                                        <option 
                                            value={item.property} 
                                            key={index}                                               
                                        >{item.display}</option> 
                                    ))}
                            </select>
                            &nbsp;
                            <select 
                                id="configuration_addAuthorization_conditionOperator" 
                                defaultValue={this.state.curConditionOperator}                              
                                onChange={(_event) => {
                                    this.setState({curConditionOperator : _event.target.value});
                                    this._validateAuthorization({
                                        name: this.state.curConditionName,
                                        value: this.state.curConditionValue
                                    });
                                }}
                            >
                                {getAuthorizationOperators(this.state.curConditionProperty).map((item, index) => (
                                    <option 
                                        value={item.value} 
                                        key={index}                                         
                                    >{item.display}</option> 
                                ))}
                            </select>
                            &nbsp;
                            <input 
                                type={getAuthorizationOperator(this.state.curConditionOperator).type}
                                className="value"
                                value = {this.state.curConditionValue}
                                id="configuration_addAuthorization_conditionValue" 
                                placeholder = "Value to trigger condition"
                                onChange={(_event) => {
                                    this.setState({curConditionValue : _event.target.value});
                                    this._validateAuthorization({
                                        name: this.state.curConditionName,
                                        value: _event.target.value
                                    });
                                }}
                            />
                            <div className="hint align-left">
                                The condition the user's wallet must meet for trigerring this authorization level
                            </div>                            
                        </li>
                    </ul>

                </div>

                <div className="siww-footer">
                    <div className="identity_action">
                        <div className="btn btn-tiny actionLink back"
                            onClick = {this.toggleAddAuthorization.bind(this)}
                        >
                            Cancel
                        </div>                            

                        <div className="btn btn-tiny disabled" id="btnAddAuthorization"
                            onClick = {this.addAuthorization.bind(this)}
                        >
                            Add Level
                        </div>
                    </div>
                </div>
            </div>
        </div>
        );
    }

    renderAuthLevels(_aLevels) {
        return(
            <>
                <ul className="row-list">
                    {_aLevels.map((item, index) => (
                        <li className="row compulsory"
                            key={index}
                        >
    
                            <div className="group">
                                <span className="row-name">Name</span>
                                <span className="row-property">{item.name}</span>
                            </div>
                            <div className="group">
                                <span className="row-name">Condition</span>
                                <span className="row-property">{item.condition.property? getAuthorizationCondition(item.condition.property).display + " "+getAuthorizationOperator(item.condition.operator).display+ " " +item.condition.value : "none"}</span>
                            </div>
                            {item.connector? 
                            <>
                                <div className="group">
                                    <span className="row-name">Connector</span>
                                    <span className="row-property">{getConnectorDisplayName(item.connector)}</span>
                                </div>

                                <div className="row compulsory align-left">
                                <div className="btn btn-tiny"
                                    data-name={item.name}
                                    onClick = {this.removeAuthorization.bind(this)}
                                >
                                    <img className="icon" src="/assets/images/icon_delete.png" />
                                    <span>Remove this authorization level!</span>
                                </div>
                                </div>
                            </>
                            :""}

                        </li>
                    ))}
                </ul>

                <div className="row compulsory align-left">
                    <div className={this.state.is_verified===true? "btn btn-tiny" : "btn btn-tiny disabled"}
                        onClick = {this.toggleAddAuthorization.bind(this)}
                    >
                        <img className="icon" src="/assets/images/icon_plus.png" />
                        <span>Add an authorization level...</span>
                    </div>
                    {this.state.is_verified===false ?
                        <div class="hint align-left">
                            <img class="icon" src="/assets/images/icon_warning.png" />
                            <span>Verify your domain to enable authorization levels</span>
                        </div>
                    :""}

                    {this.renderAuthorizationDialog()}

                </div>
                            
            </>
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

                    {this.state.is_verified===true || this.props.isLocalhost ? 
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

                    {this.renderScopes(this.state.aScope)}

                    <div className="category">
                        <span>Authorization levels</span>
                    </div>

                    {this.renderAuthLevels(this.state.aLevel)}

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
                    {this.renderPreview()}

                    {this.state.app_secret === ""?
                        <div 
                                className={"btn btn-primary " + (this.state.canValidate? "" : "disabled")}
                                onClick = {this.async_claimDomain.bind(this)}
                            >                                
                            Claim domain!
                        </div>

                    : 
                        <>
                            <div 
                                className={"btn btn-quiet " + (this.state.canValidate? "" : "disabled")}
                                onClick = {this.async_updateDomain.bind(this)}
                            >                                
                                Update
                            </div>

                        {this.state.is_verified===false && !this.props.isLocalhost? 
                            <div 
                                className="btn btn-primary "
                                onClick = {this.async_renewDomain.bind(this)}
                            >                                
                                Prove ownership
                            </div>
                        :""}

                        {this.state.isDialogOwnershipVisible? 
                            <DialogOwnership
                                domain_name = {this.state.domain_name}
                                app_id = {this.state.app_id}
                                app_secret = {this.state.app_secret}
                                dns_token = {this.state.dns_token}
                                onClose = {()  => this.setState({isDialogOwnershipVisible: false})}
                                onValidate = {()  => this.async_verifyDomain()}
                                message= {this.state.message}
                            />
                        :""}

                        </>
                    }

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
