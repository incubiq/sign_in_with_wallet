import {Component} from "react";

class AppAuthHeader extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    
    }

    componentDidMount() {
    }

/*
 *          
 */


    render() {
        return (
            <div className="siwc-login-header">
                <div className={"login-line client-login-info" + (this.props.theme.dark_mode? this.props.theme.dark_mode : '')}>
                    {this.props.isOauth ?
                    <>
                        <div className="display-app-logo">
                            <img className="client-login-logo" src={this.props.theme.logo} />
                            <div className="login-subtitle">
                                <span>{this.props.oauthClientName}</span>
                                <br />
                                <span>{this.props.oauthDomain}</span>
                            </div>
                        </div>
                        <div className="login-separator">↔</div>
                        <div className="hidden" id="idClient">{this.props.client_id}</div>
                    </>
                    :""}

                    <div className="display-app-logo">
                        <img className="client-login-logo" src={this.props.SIWCLogo} />
                        <div className="login-subtitle">Sign-in with<br />{this.props.theme.name}</div>
                    </div>
                </div>
            </div>
        )
    }
}

export default AppAuthHeader;
