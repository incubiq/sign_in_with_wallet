import AppBase from "../appBase";

// class for displaying top banner in admin mode
class AdminPanelHeader extends AppBase {
    

    onShowDomains() {
        this.props.onRedirect("/app/domains");
    }

    onShowSettings() {
        this.props.onRedirect("/app/settings");        
    }


/*
 *          Render
 */

    render() {
        return( 
            <>
                <div className="adminPanel-header">
                    <div className="align-left">
                        <a href="/app">
                            <img 
                                src="/assets/images/logo_siww.png"
                                className="logo"
                            />
                        </a>
                    </div>
                    <div className="align-right">
                        <div 
                            className={"btn btn-tiny " + (this.props.view==="domains" ? "selected": "")}
                            onClick = {this.onShowDomains.bind(this)}
                        >
                            Domains
                        </div>

                        <div 
                            className={"btn btn-tiny " + (this.props.view==="settings" || this.props.view==="home" ? "selected": "")}
                            onClick = {this.onShowSettings.bind(this)}
                        >
                            Settings
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default AdminPanelHeader;