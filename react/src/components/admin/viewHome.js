import AdminViewBase from "./viewBase";
import FormAbout from "./formAbout";
import FormIdentity from "./formIdentity";
import FormConnectedApps from "./formConnectedApps";
import FormClaimedDomains from "./formClaimedDomains";

const MENU_IDENTITY = 1;
const MENU_APPS = 2;
const MENU_DOMAINS = 3;
const MENU_SIWW = 4;

class AdminViewHome extends AdminViewBase {

/*
 *          page inits
 */



    constructor(props) {
        super(props);
        this.state=  Object.assign({}, this.state, {
            
            // menu selection
            iSelMenu: MENU_IDENTITY,

        });
    }

/*
 *        UI
 */
 
    onSelectSubmenu(iSubMenu) {
        this.setState({iSelMenu : iSubMenu});
    }

    renderContent() {
        let objIdentity=null;
        if(this.state.iSelectedIdentity!==null) {
            objIdentity=this.state.aIdentity[this.state.iSelectedIdentity];
        }
        return( 
            <div className="adminPanel-content">
                <div className="adminPanel-selector noselect">
                    <ul className="menu-list">
                        <li 
                            className={"menu-selector " + (this.state.iSelMenu===MENU_IDENTITY? "selected" : "")}
                            onClick = {( ) => this.onSelectSubmenu(MENU_IDENTITY)}
                        >
                            <div>
                                <img className="menu-logo" src="/assets/images/anon_user.png" alt="identity" />
                                <div className="menu-name">Identity</div>
                            </div>
                        </li>

                        <li 
                            className={"menu-selector " + (this.state.iSelMenu===MENU_APPS? "selected" : "")}
                            onClick = {( ) => this.onSelectSubmenu(MENU_APPS)}
                        >
                            <div>
                                <img className="menu-logo" src="/assets/images/connect_app.png" alt="connected apps" />
                                <div className="menu-name">Connected Apps</div>
                            </div>
                        </li>

                        <li 
                            className={"menu-selector " + (this.state.iSelMenu===MENU_DOMAINS? "selected" : "")}
                            onClick = {( ) => this.onSelectSubmenu(MENU_DOMAINS)}
                        >
                            <div>
                                <img className="menu-logo" src="/assets/images/logo_www.png" alt="connected apps" />
                                <div className="menu-name">Domains</div>
                            </div>
                        </li>

                        <li 
                            className={"menu-selector " + (this.state.iSelMenu===MENU_SIWW? "selected" : "")}
                            onClick = {( ) => this.onSelectSubmenu(MENU_SIWW)}
                        >
                            <div>
                                <img className="menu-logo" src="/assets/images/logo_siww.png" alt="Sign with Wallet" />
                                <div className="menu-name">Sign with Wallet</div>
                            </div>
                        </li>

                    </ul>

                </div>


                <div className="adminPanel-form">
                    
                    <FormIdentity 
                        identity = {objIdentity}
                        isVisible = {this.state.iSelMenu===MENU_IDENTITY}
                        AuthenticationCookieToken = {this.props.AuthenticationCookieToken}
                    />

                    <FormConnectedApps        
                        aApps = {this.state.aConnectedApps}                 
                        isVisible = {this.state.iSelMenu===MENU_APPS}
                        AuthenticationCookieToken = {this.props.AuthenticationCookieToken}
                    />

                    <FormClaimedDomains        
                        identity = {objIdentity}
                        aClaimedDomain = {this.state.aClaimedDomain}
                        isVisible = {this.state.iSelMenu===MENU_DOMAINS}
                        AuthenticationCookieToken = {this.props.AuthenticationCookieToken}

                        onNotifyConfirm = {this.onNotifyConfirm.bind(this)}
                        fnReloadDomains = {this.async_loadDomains.bind(this)}
                        theme = {this.props.theme}
                        styles = {this.props.styles}
                        version = {this.props.version}
                    />
    
                    <FormAbout        
                        version = {this.props.version}                 
                        isVisible = {this.state.iSelMenu===MENU_SIWW}
                    />
    

                </div>


            </div>
        );
    }
}

export default AdminViewHome;
