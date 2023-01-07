import {Component} from "react";

class ViewHeader extends Component {

/*
 *      UI 
 */

    render() {
        return (
            <div className={"siww-header "+ (this.props.theme.webapp.dark_mode? this.props.theme.webapp.dark_mode : '')}>
                {this.props.isOauth ?
                <>
                    <div className="display-app-logo">
                        <img className="client-login-logo" src={this.props.theme.webapp.logo} alt="logo" />
                        <div className="login-subtitle">
                            <span>{this.props.oauthClientName !==""? this.props.oauthClientName : "???"}</span>
                            <br />
                            <span>{this.props.oauthDomain !==""? this.props.oauthDomain : "https://???"}</span>
                        </div>
                    </div>

                    <div>
                        <div className="hidden" id="idClient">{this.props.app_id}</div>
                        <div className="login-separator">↔</div>
                        {this.props.is_verified===false? 
                            <div className="red" title="Ownership of this application is not yet confirmed">⚠</div>
                        :""}
                    </div>

                </>
                :""}

                <div className="display-app-logo">
                    <img className="client-login-logo" src={this.props.SIWWLogo} alt="logo"/>
                    <div className="login-subtitle">Sign-in with<br />{this.props.theme.name}</div>
                </div>
            </div>
        )
    }
}

export default ViewHeader;
