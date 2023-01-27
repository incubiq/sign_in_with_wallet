import AppBase from "./appBase";
import AdminPanelHeader from "./adminPanelHeader";
import {srv_getDomains} from "../services/configure";
import {getIdentityFromUsername} from "../services/me";

import jsonwebtoken from "jsonwebtoken";

class AdminViewBase extends AppBase {

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
            aReservedDomain: [],

            // UI 
            view: props.view              // the current view

        });
    }

    onSelectIdentity(_wallet_id) {
        let i=this.state.aIdentity.findIndex(function (x) {return x.wallet_id===_wallet_id});
        if(i!==-1) {
            this.setState({iSelectedIdentity: i});
        }
        return {data: null}       
    }

    logUser() {
        let that=this;
        this.async_getUserFromCookie()
            .then(_obj => {
                if(!_obj) {
                    // full relog / reload
                    window.location="/admin";
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

            // we wait 1.5sec to see if user can be logged.. if not.. we go back to oAuth for loging
            let that=this;
            setTimeout(function() {
                // still no token? stop waiting
                if(!that.props.AuthenticationCookieToken) {
//                    srv_login()
//                    that.props.onRedirect("/admin");

                    // we need to refresh this for good (get new admin cookie and token)
                    window.location="/admin";
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

    renderHeader () {
        return (
            <AdminPanelHeader 
                onRedirect = {this.props.onRedirect}
                view={this.state.view}
            />            
        );
    }

    renderContent() {
        return (<>
            <div className="siww_warning_banner">Preview version - will be released OFFICIALLY early 2023...</div>        
        </>)
    }

    render() {
        return( 
            <> 
                {this.renderHeader()}                
                {this.renderContent()}
                {this.renderFooter()}
            </>
        );
    }
}

export default AdminViewBase;
