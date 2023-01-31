import AdminViewBase from "./viewBase";
import FormIdentity from "./formIdentity";
import FormConnectedApps from "./formConnectedApps";
import {deleteMeAdmin} from "../../services/me";

const MENU_IDENTITY = 1;
const MENU_APPS = 2;

class AdminViewSettings extends AdminViewBase {

/*
 *          page inits
 */



constructor(props) {
    super(props);

    this.state=  Object.assign({}, this.state, {
        iSelMenu: MENU_IDENTITY
    });
}

/*
 *        UI
 */
 
    onLogout() {
        // 
        deleteMeAdmin();

        // redirect to a logout...
        window.location="/admin/logout";
    }

    onSelectSubmenu(iSubMenu) {
        this.setState({iSelMenu : iSubMenu});
    }

    renderToolbar( ){
        return (
            <div className="toolbar">

                <div 
                    className={"btn btn-tiny right btn-primary "}
                    onClick = {this.props.onLogout}
                >                                
                    👋 Logout
                </div>
            
            </div>      
        );
    }

    renderContent() {
        let objIdentity=null;
        if(this.state.iSelectedIdentity!==null) {
            objIdentity=this.state.aIdentity[this.state.iSelectedIdentity];
        }
        return( 
            <div className="adminPanel-content">
                <div className="adminPanel-selector noselect">
                    <ul className="panel-list">
                        <li 
                            className={"domain-selector " + (this.state.iSelMenu===MENU_IDENTITY? "selected" : "")}
                            onClick = {( ) => this.onSelectSubmenu(MENU_IDENTITY)}
                        >
                            <div>
                                <img className="domain-logo" src="/assets/images/anon_user.png" alt="identity" />
                                <div className="domain-name">Identity</div>
                            </div>
                        </li>

                        <li 
                            className={"domain-selector " + (this.state.iSelMenu===MENU_APPS? "selected" : "")}
                            onClick = {( ) => this.onSelectSubmenu(MENU_APPS)}
                        >
                            <div>
                                <img className="domain-logo" src="/assets/images/logo_www.png" alt="connected apps" />
                                <div className="domain-name">Connected Apps</div>
                            </div>
                        </li>
                    </ul>

                </div>


                <div className="adminPanel-form">
                    {this.renderToolbar()}
                    
                    <FormIdentity 
                        identity = {objIdentity}
                        onLogout = {this.onLogout.bind(this)}
                        isVisible = {this.state.iSelMenu===MENU_IDENTITY}
                    />

                    <FormConnectedApps        
                        aApps = {this.state.aConnectedApps}                 
                        isVisible = {this.state.iSelMenu===MENU_APPS}
                    />
    
                </div>


            </div>
        );
    }
}

export default AdminViewSettings;
