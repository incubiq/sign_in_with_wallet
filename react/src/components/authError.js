import AuthConnect from "./authConnect";
import ViewHeader from "./viewHeader";

import {WidgetMessage} from "../utils/widgetMessage";
import {getDefault} from "../const/connectors"; 

class AuthError extends AuthConnect {

/*
 *          inits
 */

    constructor(props) {
        super(props);    

        this.state= Object.assign({}, this.state, {

            // err msg
            headline: "Error whilst authenticating!",
            message: "",

        });                
    }

    componentDidMount() {
        super.componentDidMount();
        let _msg=decodeURIComponent(decodeURIComponent(this.getmyuri("message",  window.location.search)));
        this.setState({message: _msg})
    } 
    
/*
 *          Render
 */

    render() {
        return (
            <div id="siww-login-container" style={this.props.styles.container}>
                <div className={"modal modal-login center-vh" + (this.state.theme.webapp.dark_mode ? "dark-mode": "")} style={this.props.styles.color}>

                    <ViewHeader 
                        app_id= {this.props.webAppId}
                        oauthClientName = {this.props.webAppName ? this.props.webAppName : "Unknown App"}
                        oauthDomain = {this.props.webAppDomain ? this.props.webAppDomain : "<unconfigured>"}
                        is_verified = {this.props.webApp && this.props.webApp.is_verified===true ? true : false}
                        isOauth = {true}
                        theme = {this.state.theme}
                        aConnector = {this.state.aActiveConnector}
                        connector = {this.state.iActiveConnector!==null ? this.state.aActiveConnector[this.state.iActiveConnector] : {assets: getDefault()}}
                    />

                    <WidgetMessage 
                        error = {true}
                        headline =  {this.state.headline}
                        text = {this.state.message}
                    />     

                    {this.renderFooter()}

                </div>
        </div>
        )
    }
}

export default AuthError;