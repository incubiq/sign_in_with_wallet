import {Component} from "react";

class ViewHeader extends Component {

/*
 *      UI 
 */
    constructor(props) {
        super(props);    
        this.state={
            key: 0
        }
    }

    componentDidUpdate(prevProps) {
        // trick to get the image show up and update...
        if(this.props.connector.assets.logo !== prevProps.connector.assets.logo) {
            let _key = this.state.key+1;
            this.setState({key: _key})    
        }
    }

    renderBlockchainImages() {
        return (
            <>
            {this.props.aConnector? 
                this.props.aConnector.map((item, index) => (   
                    <img className={item.symbol===this.props.connector.assets.symbol? "client-login-logo siww": "hidden"} src={item.assets.logo} alt={"logo "+this.props.connector.assets.blockchain}></img>
                ))
            :""}
                <img className={this.props.connector.assets.symbol==="SIWW"? "client-login-logo siww": "hidden"} src="/assets/images/logo_siww.png" alt="logo SIWW"></img>
            </>

        )
    }

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
                    <div className="client-login-logo_container">
                        <img className="client-login-logo siww" src="/assets/images/logo_siww_contour.png" alt="siww background"/>

                        {/* pre-loading all images here.. and on;lyshowing the OK one  (avoid a noshow on image update) */}
                        {this.renderBlockchainImages()}
                    </div>
                    <div className="login-subtitle">Sign with Wallet<br />{this.props.connector.assets.blockchain}</div>
                </div>
            </div>
        )
    }
}

export default ViewHeader;
