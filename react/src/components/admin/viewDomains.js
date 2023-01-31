import AdminViewBase from "./viewBase";
import FormDomainsList from "./formDomainsList";
import AdminFormReserve from "./formDomainReserve";
import AdminFormConfigure from "./formDomainConfigure";
import AdminFormStats from "./formDomainStats";

class AdminViewDomains extends AdminViewBase {

/*
 *          page inits
 */


    constructor(props) {
        super(props);

        this.state= Object.assign({}, this.state, {

            app_id: props.webAppId ? props.webAppId : null,
            claimed_domain:  props.webAppDomain?  props.webAppDomain : "",
            iSelDomain: null,

            isEditing: false,                               // are we in edit mode?

        });    
    }

/*
 *        UI
 */

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

    onClickConfigure( ){
        this.setState({isEditing: true});
    }

    onChangeAppId(appId, index) {
        this.setState({
            isEditing: false,
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
                    claimed_domain: this.state.aClaimedDomain[index].domain_name, 
                    iSelDomain: index
                });
            }
        }
    }

    onReserveApp(objApp){
        this.setState({
            app_id: objApp.app_id,
            claimed_domain: objApp.domain_name,
            isEditing: true
        });

        //             this.props.fnShowMessage({message: "Fill-up data and scroll down to claim domain"});

    }

    renderConfigure( ) {
        let that =this;
        return (
            <AdminFormConfigure
                version={this.props.version}
                isDebug={this.props.isDebug}
                onRedirect={this.props.onRedirect}
                fnShowMessage={this.showMessage.bind(this)}

                theme={this.props.theme} 
                styles={this.props.styles}
                isPreview={this.state.isPreview}
                onClickExit = {() => {
                    if(this.state.iSelDomain===null && this.state.app_id!=="localhost") {
                        this.setState({
                            app_id: null,
                            claimed_domain: ""
                        });
                    }
                    this.setState({isEditing: false});
                }}
                onNotifyConfirm = {this.onNotifyConfirm.bind(this)}
                onNotifyClaimedDomain = {(id_domain)=> {

                    // reload all domains and set the new iSel
                    that.async_loadDomains()
                        .then(_data => {
                            if(_data.aClaimed) {
                                let i=_data.aClaimed.findIndex(function (x) {return x.app_id===id_domain});
                                that.setState({iSelDomain: i})
                            }
                        })
                }}

                isLocalhost= {this.props.webAppId==="localhost"}
                domain_name= {this.state.claimed_domain}
                app_id= {this.state.app_id}
                app_secret= {this.state.app_secret}
                AuthenticationCookieToken={this.props.AuthenticationCookieToken}
            />               
        )
    }
    
    renderReserve( ) {
        return (
            <AdminFormReserve
                domain_name= {this.state.claimed_domain}
                AuthenticationCookieToken={this.props.AuthenticationCookieToken}
                onReserveApp = {this.onReserveApp.bind(this)}
            />               
        )
    }

    renderStats() {
        let objLocalhost = this._getLocalhostObject();
        let objDomain =  objLocalhost;
        if(this.state.iSelDomain!==null) {
            objDomain=this.state.aClaimedDomain[this.state.iSelDomain];
        }
        return (<>
            <AdminFormStats 
                app_id = {this.state.app_id}
                app_secret = {objDomain.app_secret}
                AuthenticationCookieToken = {this.props.AuthenticationCookieToken}
                dns_token = {objDomain.dns_token}
                display_name = {objDomain.display_name}
                domain_name  = {objDomain.domain_name}
                logo  = {objDomain.theme.logo}
                is_verified = {objDomain.is_verified}
                aScope = {objDomain.a_permission_data}

                fnShowMessage = {() => {}}
                onClickConfigure = {this.onClickConfigure.bind(this)}

                theme = {this.props.theme}
                styles = {this.props.styles}
                version={this.props.version}
            />
        </>)
    }

    renderContent() {
        return( 
            <div className="adminPanel-content">
                <div className="adminPanel-selector noselect">
                    <FormDomainsList
                        app_id = {this.state.app_id}
                        iSelDomain = {this.state.iSelDomain}
                        aClaimedDomain = {this.state.aClaimedDomain}
                        onChangeAppId = {this.onChangeAppId.bind(this)}
                    />
                </div>

                <div className="adminPanel-form">
                    {this.state.app_id==="localhost" || this.state.claimed_domain!==null ? 

                        this.state.claimed_domain===""? 
                            this.renderReserve()
                        :
                            this.state.isEditing?
                                this.renderConfigure()
                            :
                            this.renderStats()        
                    : <></>
                    }

                </div>

            </div>
        );
    }
}

export default AdminViewDomains;
