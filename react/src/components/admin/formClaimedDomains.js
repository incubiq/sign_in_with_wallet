import {Component} from "react";
import AdminFormReserve from "./formDomainReserve";
import AdminFormConfigure from "./formDomainConfigure";
import AdminFormStats from "./formDomainStats";
import {getDefault} from "../../const/connectors"; 

// to prove ownership
import AdminDialogProveOwnership from "./dialogProveOwnership"
import {srv_renewDNS} from "../../services/configure";

// for preview
import ViewFooter from "../viewFooter";
import ViewHeader from "../viewHeader";
import ViewDataShare from "../viewDataShare";

const fakeIdentity = {
    username: "<user_1234567890>",
    wallet_id: "<wallet>",
    wallet_address: "<addr...>",
    wallet_name: "Metamask",
    blockchain_name: "Ethereum",
}

// 
class FormClaimedDomains extends Component {

    
    constructor(props) {
        super(props);
        this.state= {
            
            // domains related
            app_id: null,
            app_secret: null,
            claimed_domain:  "",
            iSelDomain: null,
            dns_token: null,

            // UI
            isEditingDomain: false,                               // are we in edit mode?
            isClaimingDomain: false,                              // are we in claim mode?
            isShowingStats: false,
            isPreview: false,
            isDialogOwnershipVisible: false
        }
    }

    componentDidUpdate(prevProps) {

        // customise the fake identity (for preview display) to who we are
        if(this.props.identity && this.props.identity!==prevProps.identity) {
            fakeIdentity.username=this.props.identity.username;
            fakeIdentity.wallet_address=this.props.identity.wallet_address;
            fakeIdentity.blockchain_name=this.props.identity.blockchain_name;
            fakeIdentity.wallet_name=this.props.identity.wallet_name;
            fakeIdentity.blockchain_name=this.props.identity.blockchain_name;
        }        
    }


    _getLocalhostObject() {
        return {
            app_secret: "localhost",
            dns_token: "localhost",
            display_name: "localhost",
            domain_name: "localhost",
            is_verified: false,
            a_permission_data: [{
                label: "Username",
                property: "username"
            }, {
                label: "Wallet Address",
                property: "wallet_address"
            }],
            theme: {
                logo: "/assets/images/logo_www.png"
            }
        }
    }
    
/*
 *          UI
 */


    onChangeAppId(appId, index) {
        this.setState({
            app_id: appId
        });

        // case create
        if(!appId) {
            this.setState({
                claimed_domain: "",
                iSelDomain: null
            });
        }
        else {
            // localhost
            if(index===-1) {
                this.setState({
                    claimed_domain: "localhost",
                    iSelDomain: null
                });
            }
            // a domain was selected
            else {
                this.setState({
                    claimed_domain: this.props.aClaimedDomain[index].domain_name, 
                    iSelDomain: index
                });
            }
        }
    }

/*
 *          UI Claim Domains
 */

    renderReserve( ) {
        return (
            <AdminFormReserve
                domain_name= {this.props.claimedDomain}
                AuthenticationCookieToken={this.props.AuthenticationCookieToken}
                onReserveApp = {this.onReserveApp.bind(this)}
                onClickExit = {this.onExitReserve.bind(this)}
            />               
        )
    }

    onReserveApp(objApp){
        this.setState({
            app_id: objApp.app_id,
            claimed_domain: objApp.domain_name,
            isEditingDomain: true,
            isClaimingDomain: false,
            isShowingStats: false,
        });
    }

    onExitReserve( ) {
        this.setState({isClaimingDomain: false});
    }

/*
 *          UI Claim Domains
 */

    showMessage(msg){
        // do nothing
    }

    onExitConfigure( ) {
        if(this.state.iSelDomain===null && this.state.app_id!=="localhost") {
            this.setState({
                app_id: null,
                claimed_domain: ""
            });
        }
        this.setState({isEditingDomain: false});
    }

    onEditDomain( ){
        this.setState({
            isShowingStats: false,
            isPreview: false,
            isEditingDomain: true,
            isClaimingDomain: false
        });
    }

    onUpdateDomain(id_domain) {
        // reload all domains and set the new iSel
        this.props.fnReloadDomains()
        .then(_data => {
            if(_data.aClaimed) {
                let i=_data.aClaimed.findIndex(function (x) {return x.app_id===id_domain});
                this.setState({iSelDomain: i})
            }
        })
    }

    renderConfigure( ){
        let that =this;
        return (
            <AdminFormConfigure
                version={this.props.version}
                isDebug={this.props.isDebug}
                onRedirect={this.props.onRedirect}
                fnShowMessage={this.showMessage.bind(this)}

                theme={this.props.theme} 
                styles={this.props.styles}
                onClickExit = {this.onExitConfigure.bind(this)}
                onNotifyConfirm = {this.props.onNotifyConfirm}
                onNotifyClaimedDomain = {(id_domain)=> {
                    that.onUpdateDomain(id_domain);
                }}
                onNotifyUpdateDomain = {(id_domain)=> {
                    that.onUpdateDomain(id_domain);
                }}

                isLocalhost= {this.state.app_id==="localhost"}
                app_id= {this.state.app_id}
                domain_name= {this.state.claimed_domain}

                AuthenticationCookieToken={this.props.AuthenticationCookieToken}
            />               
        )
    }

    
    onClickConfigure( ){
        this.setState({isEditingDomain: true});
    }

/*
 *          UI List of Domains
 */

    onClaimDomain() {
        this.onChangeAppId(null, -1);
        this.setState({isClaimingDomain: true});
    }

    onConfigureLocalhost() {
        this.onChangeAppId("localhost", -1);
    }

    onSelectDomain(client_id, _index) {
        this.onChangeAppId(client_id, _index);
    }

    renderListItem(item) {
        let _strVerif = item.isVerified? "verified": "not verified";
        let _iconVerif = item.isVerified? "icon_check.png": "icon_warning.png";
        return <>        
            <div className="cell">
                <img className="domain-logo" src = {item.logo} title={item.display_name}/>            
                <div className="domain-url">                        
                    &nbsp;
                    <img className="icon" src={"/assets/images/"+_iconVerif} title={_strVerif}/>
                    &nbsp;
                    <span>{_strVerif}</span>
                </div>
            </div>

            <div className="cell">
                <div className="min60H">
                    <div className="domain-url">{item.domain_name}</div>
                    <div className="domain-name">{item.display_name}</div>
                </div>
            </div>
            <div className="cell">
                <div 
                    className="btn btn-tiny btn-primary right"
                    attr-id = {item.app_id}
                    attr-index = {item.index}
                    onClick = {(event)=> {
                        event.stopPropagation();
                        item.onSelectDomain(event);
                        this.togglePreview();
                    }}
                >Preview</div>
                <div 
                    className="btn btn-tiny btn-primary right"
                    attr-id = {item.app_id}
                    attr-index = {item.index}
                    onClick = {(event)=> {
                        event.stopPropagation();                        
                        item.onSelectDomain(event);
                        this.onEditDomain();
                    }}
                >Edit</div>

                {item.isVerified===false?
                <div 
                    className="btn btn-tiny btn-primary right"
                    attr-id = {item.app_id}
                    attr-index = {item.index}
                    onClick = {(event)=> {
                        event.stopPropagation();                        
                        let _idx=item.onSelectDomain(event);
                        this.async_renewDomain(_idx);
                    }}
                >Prove ownership</div>
                :""}

            </div>
        </>
    }

    renderList() {
        return(
            <>
                <div 
                        className={"btn btn-tiny  btn-primary "}
                        onClick = {this.onClaimDomain.bind(this)}
                    >                                
                        Claim a new domain!
                </div>

                <ul className="domain-list">                    

                    <li 
                        className="domain-selector" 
                        onClick= {this.onShowStats.bind(this)}
                    >
                        {this.renderListItem({
                            logo: "/assets/images/icon_test.png",
                            domain_name: "<localhost>",
                            display_name: "Config local test",
                            isVerified: null,          
                            app_id: "localhost",
                            index: null,                
                            onSelectDomain: () => {
                                this.onConfigureLocalhost();
                                return -1;
                            }
                        })}
                    </li>

                    {this.props.aClaimedDomain.map((item, index) => (
                        <li 
                            className= "domain-selector"
                            onClick= {this.onShowStats.bind(this)}
                            key = {index}
                        >
                            {this.renderListItem({
                                logo: item.theme.logo,
                                domain_name: item.domain_name,
                                display_name: item.display_name,
                                isVerified: item.is_verified,
                                app_id: item.app_id,
                                index: index,
                                onSelectDomain: (evt) => {
                                    let idElt=evt.currentTarget;
                                    let _id=idElt.getAttribute("attr-id");
                                    let _idx=parseInt(idElt.getAttribute("attr-index"));
                                    this.onSelectDomain(_id, _idx);
                                    return _idx;
                                }
                            })}
                        </li>
                    ))}

                </ul>
                
            </>);
    }

/*
 *          Stats UI
 */

    onShowStats( ){
        this.setState({
            isShowingStats: true,
            isPreview: false,
            isEditingDomain: false,
            isClaimingDomain: false
        });
    }

    renderStats( ){
        let objLocalhost = this._getLocalhostObject();
        let objDomain =  objLocalhost;
        if(this.state.iSelDomain!==null) {
            objDomain=this.props.aClaimedDomain[this.state.iSelDomain];
        }
        return (<>
            
        </>)
    }    


/*
 *          Preview dialog 
 */

    togglePreview(event) {
        let _isPreview=!this.state.isPreview;
        this.setState({isPreview: _isPreview});
    }

    renderPreview () {
        // dont bother if not showing
        if(!this.state.isPreview) {
            return (<></>)
        }

        let objLocalhost = this._getLocalhostObject();
        let objDomain =  objLocalhost;
        if(this.state.iSelDomain!==null) {
            objDomain=this.props.aClaimedDomain[this.state.iSelDomain];
        }

        // upgrade theme
        let _theme=JSON.parse(JSON.stringify(this.props.theme));
        if(objDomain.theme.logo) {_theme.webapp.logo=objDomain.theme.logo;}
        if(objDomain.theme.background) {_theme.webapp.background=objDomain.theme.background;}
        if(objDomain.theme.color) {
            if(objDomain.theme.color.text) {_theme.webapp.color.text=objDomain.theme.color.text;}
            if(objDomain.theme.button) {_theme.webapp.color.button=objDomain.theme.color.button;}
            if(objDomain.theme.button_text) {_theme.webapp.color.button_text=objDomain.theme.color.button_text;}
        } 
            
        return (
        <div 
            id="configuration_preview"
            className={this.state.isPreview? "preview" :"hidden"}
        >
            <div id="siww-login-container" style={this.props.styles.container}>
                <div className={"modal modal-login center-vh" + (this.props.theme && this.props.theme.webapp.dark_mode ? "dark-mode": "")} style={this.props.styles.color}>

                <ViewHeader 
                    app_id= {null}
                    oauthClientName = {objDomain.display_name}
                    oauthDomain = {objDomain.domain_name}
                    isOauth = {true}
                    theme = {_theme}
                    wallet = "Wallet"
                    aConnector = {null}
                    is_verified = {objDomain.is_verified}
                    connector = {{
                        assets: getDefault(),
                        isAccepted: true,
                    }}
                />

                <div className="siww-panel">
                    <ViewDataShare 
                        theme = {this.props.theme}
                        oauthClientName = {objDomain.display_name}
                        iSelectedIdentity = {0}
                        aIdentity = {[fakeIdentity]}
                        aScope = {objDomain.a_permission_data}
                    />                            

                    <div className="identity_action">
                        <button className="btn btn-transparent actionLink back">
                            Switch Identity!
                        </button>                            

                        <button className="btn btn-quiet">
                            Grant Access!
                        </button>
                    </div>
                </div>

                <ViewFooter 
                    version={this.props.version}
                    theme = {this.props.theme}
                    message = {""}
                />

                </div>

                <button 
                    className="btn btn-close btn-primary top left"
                    onClick = {this.togglePreview.bind(this)}
                >
                    Quit Preview
                </button>
                <button 
                    className="btn btn-close btn-primary bottom right"
                    onClick = {this.togglePreview.bind(this)}
                >
                    Quit Preview
                </button>
            </div>
        </div>
    )}

    
/*
 *          Prove Ownership of Domain
 */

    async async_renewDomain(iSelDomain) {
        let dataDomain=await srv_renewDNS(this.props.aClaimedDomain[iSelDomain].app_id, this.props.AuthenticationCookieToken);
        if(dataDomain && dataDomain.data && dataDomain.data.dns_token) {
            this.setState({dns_token: dataDomain.data.dns_token});
            this.setState({isDialogOwnershipVisible: true})    
        }
    }

    onCloseDialogProveOwnership(isVerified) {
        this.setState({isDialogOwnershipVisible: false});
        if(isVerified) {
            // reload all....
            this.onUpdateDomain(this.state.app_id);
        }
    }

/*
 *          main UI
 */

    render() {
        return(
            <>
            {this.props.isVisible?
                <>

                <div className="container">
                    {this.renderPreview()}

                    {this.state.iSelDomain!==null && this.state.iSelDomain >=0 ? 
                    <AdminDialogProveOwnership
                        isVisible = {this.state.isDialogOwnershipVisible}
                        domain_name = {this.props.aClaimedDomain[this.state.iSelDomain].domain_name}
                        app_id = {this.props.aClaimedDomain[this.state.iSelDomain].app_id}
                        app_secret = {this.props.aClaimedDomain[this.state.iSelDomain].app_secret}
                        AuthenticationCookieToken = {this.props.AuthenticationCookieToken}
                        dns_token = {this.state.dns_token}
                        onClose = {this.onCloseDialogProveOwnership.bind(this)}
                    />
                    :""}

                    {this.state.isClaimingDomain===false && this.state.isEditingDomain===false? 
                    <>
                        <h2>Your claimed domains</h2>
                        {this.renderList()}
                    </>
                    : ""}

                    {this.state.isClaimingDomain? 
                            this.renderReserve()
                    :""}

                    {this.state.isEditingDomain?
                        this.renderConfigure()
                    :""}

                    {this.state.isShowingStats?
                        this.renderStats()
                    :""}

                </div>

            </>
            :""}
            </>

        );
    }
}

export default FormClaimedDomains;
