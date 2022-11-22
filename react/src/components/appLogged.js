import AppBase from "./appBase";
import ViewDomain from "./viewDomain";
import ViewWalletConnect from "./viewWalletConnect";
import {srv_getDomains} from "../services/configure";
import {deleteMe} from "../services/me";

import jsonwebtoken from "jsonwebtoken";
import Cookies from 'js-cookie';

class AppLogged extends AppBase {

/*
 *          page inits
 */

    constructor(props) {
        super(props);
        this.state= Object.assign({}, this.state, {

            // authenticated user
            authenticated_wallet_address: null,
            authenticated_wallet_id: null,

            // all identities

            // all registered domains
            aClaimedDomain: [],
            aReservedDomain: []

        });
    }

    // init who the user is...
    componentDidMount() {
        super.componentDidMount();
        if(this.props.AuthenticationCookieToken) {

            // we are logged...

            let that=this;
            this.async_getUserFromCookie()
                .then(_obj => {
                    if(!_obj) {
                        that.props.onRedirect("auth/login");
                    }
                    else {
                        that.setState({authenticated_wallet_address: _obj.wallet_address});
                        that.setState({authenticated_wallet_id: _obj.wallet_id});
                        that.setState({hover: "You are logged as Admin of our domains"});
    
                        srv_getDomains(null, that.props.AuthenticationCookieToken)
                        .then(_data => {
                            that.setState({aClaimedDomain: _data.data.aClaimed})
                            that.setState({aReservedDomain: _data.data.aPending})                    
                        })
                    }
                });
        }
        else {
            this.props.onRedirect("auth/login");
        }
    }

    async async_getUserFromCookie( ){
        return new Promise(resolve => {
            jsonwebtoken.verify(this.props.AuthenticationCookieToken, this.props.AuthenticationCookieSecret, function(err, decoded){
                if(err) {
                    console.log("Error decoding Cookie in REACT app");
                    resolve(null);
                }
                else {
                    resolve(decoded);
                }
            })
        })
    }

/*
 *        UI
 */

    onDisconnect() {
        // 

        deleteMe();
        Cookies.remove(this.props.AuthenticationCookieName, { path: ''});
        window.location="/auth/login";
    }
    
    onSelectIdentity() {
        
    }

    onSelectDomain(client_id) {
        this.props.onRedirect("/app/configure?app_id="+client_id);
    }

    renderIdentities() {
        return (
            <>
                <div className="siww-section">
                    <h2>Your known identities</h2>
                </div>
                <div className="connectCont align-left">
                    <ul className="connectWallets"> 
                        {this.state.aIdentity.map((item, index) => (
                            <ViewWalletConnect 
                                theme = {this.state.theme}
                                wallet_id = {item.wallet_id}
                                isSelected = {index===this.state.iSelectedIdentity}
                                address = {item.wallet_address}
                                logo = {item.wallet_logo}
                                onConnect={this.onSelectIdentity}
                                onHover={() => {}}
                                index = {index}
                                key={index}
                            />
                        ))}
                    </ul>
                </div>
            </>);
    }

    renderDomains() {
        return(
            <>
                <div className="siww-section">
                    <h2>Your registered domains</h2>
                </div>
                <div className="connectCont align-left">
                    <ul className="domain-list"> 
                        <li className="domain-panel" >
                            <ViewDomain 
                                logo = "/assets/images/icon_plus.png"
                                domain_name = "<yourdomain.com>"
                                display_name = "Claim a domain!"
                                isVerified= {null}
                                onClick = {( ) => {
                                    this.props.onRedirect("/app/configure")
                                }}
                            />
                        </li>

                        {this.state.aClaimedDomain.map((item, index) => (
                            <li 
                                className="domain-panel" 
                                key = {index}
                            >

                                <ViewDomain 
                                    logo = {item.theme.logo}
                                    domain_name = {item.domain_name}
                                    display_name = {item.display_name}
                                    isVerified= {item.is_verified}
                                    app_id = {item.app_id}
                                    onClick = {(evt) => {
                                        let idElt=evt.currentTarget;
                                        let _id=idElt.getAttribute("attr-id");
                                        this.onSelectDomain(_id);
                                    }}
                                />
                            </li>
                        ))}

                    </ul>
                </div>
            </>);
    }

    renderHeader () {
        return (
            <div className="siww_configure-header">
                <h1><a href="/">Sign with Wallet</a></h1>
                <div className="align-right">
                    <div className="connected">
                        {this.state.authenticated_wallet_address? 
                        <>
                            <span>Connected with</span>
                            &nbsp;<b>{this.state.authenticated_wallet_id}</b>&nbsp;
                            <span>({this.getShortenAnonAddress(this.state.authenticated_wallet_address)})</span>
                        </>
                        : 
                        <span>Not authenticated</span>
                        }
                    </div>
                    <div 
                        className="btn btn-tiny"
                        onClick = {this.onDisconnect.bind(this)}
                    >
                        Disconnect
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return( 
            <> 
                {this.renderHeader()}
                
                <div className="siww-panel">
                    {this.state.authenticated_wallet_address? 
                        <>
                            {this.renderDomains()}                        
                            {this.renderIdentities()}
                        </>                        
                    : 
                        <>
                        </>
                    }
                </div>

                {this.renderFooter()}
            </>
        );
    }
}

export default AppLogged;
