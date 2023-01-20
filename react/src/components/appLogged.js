import AppBase from "./appBase";
import ViewDomain from "./viewDomain";
import ViewIdentitySelect from "./viewIdentitySelect";
import AuthBanner from "./authBanner";
import {srv_getDomains} from "../services/configure";
import {getIdentityFromUsername} from "../services/me";

import jsonwebtoken from "jsonwebtoken";

class AppLogged extends AppBase {

/*
 *          page inits
 */

    constructor(props) {
        super(props);
        this.state= Object.assign({}, this.state, {

            // authenticated user
            user: null,

            // all identities

            // all registered domains
            aClaimedDomain: [],
            aReservedDomain: []

        });
    }

    logUser() {
        let that=this;
        this.async_getUserFromCookie()
            .then(_obj => {
                if(!_obj) {
                    that.props.onRedirect("auth/login");
                }
                else {

                    // get user details
                    let _user = getIdentityFromUsername(_obj.username);
                    that.setState({user: _user});

                    // select this user
                    that.onSelectIdentity(_user.wallet_id);
                    that.setState({hover: "You are logged as Admin of your domains"});

                    srv_getDomains(null, that.props.AuthenticationCookieToken)
                    .then(_data => {
                        that.setState({aClaimedDomain: _data.data.aClaimed})
                        that.setState({aReservedDomain: _data.data.aPending})                    
                    })
                    .catch(err => {})
                }
            });

    }


    // init who the user is...
    componentDidMount() {
        super.componentDidMount();
        if(this.props.AuthenticationCookieToken) {

            // we need to log the user
            this.logUser();
        }
        else {

            // we wait 1.5sec to see if user can be logged.. if not.. we go back to auth/login
            let that=this;
            setTimeout(function() {
                // still no token? stop waiting
                if(!that.props.AuthenticationCookieToken) {
                    that.props.onRedirect("auth/login");
                }
            }, 1500);
        }
    }

    componentDidUpdate(prevProps) {
        super.componentDidUpdate(prevProps);

        // have we recevid a new auth token?
        if(this.props.AuthenticationCookieToken!==null && this.props.AuthenticationCookieToken!==prevProps.AuthenticationCookieToken) {
            // we need to log the user
            this.logUser();
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
    
    onSelectIdentity(_wallet_id) {
        let i=this.state.aIdentity.findIndex(function (x) {return x.wallet_id===_wallet_id});
        if(i!==-1) {
            this.setState({iSelectedIdentity: i});
        }
        return {data: null}
        
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
                            <ViewIdentitySelect 
                                theme = {this.state.theme}
                                wallet_id = {item.wallet_id}
                                wallet_name = {item.wallet_name}
                                wallet_logo = {item.wallet_logo}
                                blockchain_image = {item.blockchain_image}
                                blockchain_name = {item.blockchain_name}
                                isSelected = {index===this.state.iSelectedIdentity}
                                address = {item.wallet_address}
                                onConnect={this.onSelectIdentity.bind(this)}
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

                        <li className="domain-panel" >
                            <ViewDomain 
                                logo = "/assets/images/icon_test.png"
                                domain_name = "<localhost>"
                                display_name = "Config local test"
                                isVerified= {null}
                                onClick = {( ) => {
                                    this.props.onRedirect("/app/configure?app_id=localhost")
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
            <AuthBanner 
                authenticated_wallet_address = {this.state.user? this.state.user.wallet_address: ""}
                authenticated_wallet_id = {this.state.user? this.state.user.wallet_id: ""}
                AuthenticationCookieName = {this.props.AuthenticationCookieName}
            />            
        );
    }

    render() {
        return( 
            <> 
                {this.renderHeader()}
                
                <div className="siww-panel">
                    {this.state.user && this.state.user.wallet_address? 
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
