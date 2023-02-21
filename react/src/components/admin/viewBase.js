import AppBase from "../appBase";
import {srv_getDomains} from "../../services/configure";
import {getMyIdentities, getIdentityFromWallet, updatePartialIdentity, getMyConnecteddApps} from "../../services/me";
import WidgetDialog from "../../utils/widgetDialog"

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

            // all registered domains
            aClaimedDomain: [],
            aReservedDomain: [],
            iSelectedIdentity: null,

            // UI 
            view: props.view,              // the current view

            // connected apps
            aConnectedApps: [],

            isConfirmDialogVisible : false,
            confirmTitle: "",
            confirmMessage: "",
            confirmFirstButtonText: null,
            confirmSecondButtonText: null,
            onNotifyConfirm: null

        });
    }

    onSelectIdentity(_wallet_id) {
        let i=this.state.aIdentity.findIndex(function (x) {return x.wallet_id===_wallet_id});
        if(i!==-1) {
            this.setState({iSelectedIdentity: i});
        }
        return {data: null}       
    }

    async async_loadConnectedApps() {
        let _aC= getMyConnecteddApps();
        this.setState({aConnectedApps: _aC});
    }

    async async_loadDomains() {
        try {
            let _data = await srv_getDomains(null, this.props.AuthenticationCookieToken)
            if(!_data || !_data.data) {throw new Error}

            this.setState({aClaimedDomain: _data.data.aClaimed});
            this.setState({aReservedDomain: _data.data.aPending});
            return _data.data
        }
        catch(err){}
    }

    logUser() {
        let that=this;

        // make sure we have the user s identities
        let aId=getMyIdentities();
        if(this.state.aIdentity.length<aId.length) {
            this.setState({aIdentity: aId});
        }
        
        this.async_getUserFromCookie()
            .then(_obj => {
                if(!_obj) {
                    // full relog / reload
                    window.location="/admin";
                }
                else {

                    // get user details
                    let _user = getIdentityFromWallet(_obj.wallet_id, _obj.connector, _obj.blockchain_symbol);
                    if(!_user) {
                        // bit of a problem!!
                        window.location="/admin/unauthorized";
                        return;
                    }

                    // update user details
                    updatePartialIdentity(_obj.wallet_id, _obj.connector, {
                        username: _obj.username,
                        wallet_address: _obj.wallet_address,
                    });

                    that.setState({user: _user});

                    // select this user
                    that.onSelectIdentity(_user.wallet_id);
                    that.setState({hover: "You are logged as Admin of your domains"});
                    that.async_loadDomains();
                    that.async_loadConnectedApps();
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

    onNotifyConfirm (objParam) {
        this.setState({
            confirmTitle: objParam.title,
            confirmMessage: objParam.message,
            confirmFirstButtonText: objParam.confirmFirstButtonText? objParam.confirmFirstButtonText : null,
            confirmSecondButtonText: objParam.confirmSecondButtonText? objParam.confirmSecondButtonText : null,
            isConfirmDialogVisible: true,
            onNotifyConfirm : objParam.onNotifyConfirm? objParam.onNotifyConfirm : function (){}
        })
    }

    onNotifyConfirmChoice (iChoice) {
        this.setState({
            isConfirmDialogVisible: false
        });
        this.state.onNotifyConfirm(iChoice);
    }

    renderContent() {
        return (<>
            <div className="siww_warning_banner">Preview version - will be released OFFICIALLY early 2023...</div>        
        </>)
    }

    renderConfirmDialog(){
        return (
            <WidgetDialog
                title = {this.state.confirmTitle}
                message = {this.state.confirmMessage}
                version = {this.props.version}
                isVisible = {this.state.isConfirmDialogVisible}
                firstButtonText = {this.state.confirmFirstButtonText}
                secondButtonText = {this.state.confirmSecondButtonText}
                onConfirm = {this.onNotifyConfirmChoice.bind(this)}
            />
        );
    }

    render() {
        return( 
            <>
                {this.renderConfirmDialog()}
                <div className="adminPanel"> 
                    {this.renderContent()}
                    {this.renderFooter()}
                </div>
            </>
        );
    }
}

export default AdminViewBase;
