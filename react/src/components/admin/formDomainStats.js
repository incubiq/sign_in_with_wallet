import {Component} from "react";
import ViewFooter from "../viewFooter";
import ViewHeader from "../viewHeader";
import ViewDataShare from "../viewDataShare";
import AdminDialogProveOwnership from "./dialogProveOwnership"
import {getDefault} from "../../const/connectors"; 
import {srv_renewDNS} from "../../services/configure";

const fakeIdentity = {
    username: "<user_1234567890>",
    wallet_id: "<wallet>",
    wallet_address: "<addr...>"
}

class AdminFormStats extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    
        this.state={
            isPreview: false,
            isDialogOwnershipVisible: false,

        }
    }

/*
 *          Prove Ownership of Domain
 */


    async async_renewDomain() {
        let dataDomain=await srv_renewDNS(this.props.app_id, this.props.AuthenticationCookieToken);
        if(dataDomain && dataDomain.data && dataDomain.data.dns_token) {
            this.setState({dns_token: dataDomain.data.dns_token});
            this.setState({isDialogOwnershipVisible: true})    
        }
    }

    onCloseDialogProveOwnership(isVerified) {
        this.setState({isDialogOwnershipVisible: false});
        if(isVerified) {
            this.setState({is_verified: true});
        }
    }

/*
 *          Preview dialog 
 */

    togglePreview(event) {
        let eltPreview=document.getElementById("configuration_preview");
        eltPreview.className=this.state.isPreview? "hidden": "preview"
        this.props.fnShowMessage({
            message: (this.state.isPreview) ? "Fill-up data and scroll down to claim domain" : "Preview of the Authentication dialog..."
        });
        this.setState({isPreview: !this.state.isPreview});
    }

    renderPreview () {
        return (
        <div 
            id="configuration_preview"
            className="hidden"
        >
            <div id="siww-login-container" style={this.props.styles.container}>
                <div className={"modal modal-login center-vh" + (this.props.theme && this.props.theme.webapp.dark_mode ? "dark-mode": "")} style={this.props.styles.color}>

                <ViewHeader 
                    app_id= {null}
                    oauthClientName = {this.props.display_name}
                    oauthDomain = {this.props.domain_name}
                    isOauth = {true}
                    theme = {this.props.theme}
                    wallet = "Wallet"
                    aConnector = {null}
                    connector = {{
                        assets: getDefault(),
                        isAccepted: true,
                    }}
                />

                <div className="siww-panel">
                    <ViewDataShare 
                        theme = {this.props.theme}
                        oauthClientName = {this.props.display_name}
                        iSelectedIdentity = {0}
                        aIdentity = {[fakeIdentity]}
                        aScope = {this.props.aScope}
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

    render() {
        return (<>
                {this.renderPreview()}

                <AdminDialogProveOwnership
                    isVisible = {this.state.isDialogOwnershipVisible}
                    domain_name = {this.props.domain_name}
                    app_id = {this.props.app_id}
                    app_secret = {this.props.app_secret}
                    AuthenticationCookieToken = {this.props.AuthenticationCookieToken}
                    dns_token = {this.props.dns_token}
                    onClose = {this.onCloseDialogProveOwnership.bind(this)}
                />

                    <div className="appSummary">
                        <div>
                            <img className="IdentitySelectChainLogo inlineBlock" src={this.props.logo} />
                            <div className="inlineBlock">
                                <ul className="row-list">
                                        <li className="row">
                                            <div className="group">
                                                <div className="row-name">App:</div>
                                                <div className="row-property">{this.props.domain_name}</div>
                                            </div>
                                        </li>
                                        <li className="row">
                                            <div className="group">
                                                <div className="row-name">Is verified?</div>
                                                <div className="row-property">{this.props.is_verified? "Yes": "No"}</div>
                                            </div>
                                        </li>
                                </ul>
                            </div>
                        </div>

                        <div 
                            className="btn btn-tiny right btn-primary" 
                            onClick = {this.togglePreview.bind(this)}
                        >
                          Preview...
                        </div>

                        <div 
                            className="btn btn-tiny right btn-primary" 
                            onClick = {this.props.onClickConfigure}
                        >
                          Configure! 
                        </div>

                    {this.props.app_id!=="localhost" && this.props.is_verified===false ?
                        <div 
                            className="btn btn-tiny right btn-primary" 
                            onClick = {this.async_renewDomain.bind(this)}
                        >
                        Prove ownership!
                        </div>
                    :""}

                    </div>

                    <div className="appStats">
                        Stats for your domain

                    </div>

        </>)
    }
}

export default AdminFormStats;
