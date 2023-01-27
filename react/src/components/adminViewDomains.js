import AdminViewBase from "./adminViewBase";
import ViewDomain from "./viewDomain";

import AdminFormConfigure from "./adminFormConfigure";

class AdminViewDomains extends AdminViewBase {

/*
 *          page inits
 */


    constructor(props) {
        super(props);

        this.state= Object.assign({}, this.state, {
            claimed_domain:  props.webAppDomain?  props.webAppDomain : "",
            app_id: props.webAppId ? props.webAppId : null,
            iSelDomain: null,
        });    
    }

    onConfigureLocalhost() {
        this.setState({app_id: "localhost"});
//        this.props.onRedirect("/app/configure?app_id=localhost")
    }

    onClaimDomain() {
        this.setState({app_id: null});
        this.setState({claimed_domain: ""});
        this.setState({iSelDomain: null});
//        this.props.onRedirect("/app/configure")
    }

/*
 *        UI
 */
   
    onSelectDomain(client_id) {
        this.setState({app_id: client_id});
//        this.props.onRedirect("/app/configure?app_id="+client_id);
    }

    renderConfigure( ) {
        return (
            <AdminFormConfigure
                version={this.props.version}
                isDebug={this.props.isDebug}
                onRedirect={this.props.onRedirect}
                fnShowMessage={this.showMessage.bind(this)}

                theme={this.props.theme} 
                styles={this.props.styles}
                isPreview={this.state.isPreview}

                isLocalhost= {this.props.webAppId==="localhost"}
                domain_name= {this.state.claimed_domain}
                app_id= {this.state.app_id}
                app_secret= {this.state.app_secret}
                AuthenticationCookieToken={this.props.AuthenticationCookieToken}
            />               
        )
    }

    renderDomains() {
        return(
            <>
            <div className="adminPanel-content">
                <div className="adminPanel-selector">
                    <ul className=" domain-list"> 
                        <li className={"domain-selector" + (this.state.app_id===null && this.state.iSelDomain===null ? " selected" : "")} >
                            <ViewDomain 
                                logo = "/assets/images/icon_plus.png"
                                domain_name = "<yourdomain.com>"
                                display_name = "Claim a domain!"
                                isVerified= {null}
                                onClick = {this.onClaimDomain.bind(this)}
                            />
                        </li>

                        <li className={"domain-selector" + (this.state.app_id==="localhost"? " selected": "")} >
                            <ViewDomain 
                                logo = "/assets/images/icon_test.png"
                                domain_name = "<localhost>"
                                display_name = "Config local test"
                                isVerified= {null}
                                onClick = {this.onConfigureLocalhost.bind(this)}
                            />
                        </li>

                        {this.state.aClaimedDomain.map((item, index) => (
                            <li 
                                className= {"domain-selector" + (this.state.aClaimedDomain.length>0 && this.state.app_id!=="localhost" && index===this.state.iSelDomain? " selected" : "")}
                                key = {index}
                            >

                                <ViewDomain 
                                    logo = {item.theme.logo}
                                    domain_name = {item.domain_name}
                                    display_name = {item.display_name}
                                    isVerified= {item.is_verified}
                                    app_id = {item.app_id}
                                    index = {index}
                                    onClick = {(evt) => {
                                        let idElt=evt.currentTarget;
                                        let _id=idElt.getAttribute("attr-id");
                                        let _idx=idElt.getAttribute("attr-index");
                                        this.onSelectDomain(_id);
                                        this.setState({iSelDomain: parseInt(_idx)})
                                    }}
                                />
                            </li>
                        ))}

                    </ul>
                    </div>

                    <div className="adminPanel-form">
                        {this.state.app_id==="localhost" || this.state.claimed_domain!==null ? 
                            this.renderConfigure()
                        : <></>
                        }
                    </div>
                </div>
            </>);
    }

    renderContent() {
        return( 
            <>
                {this.renderDomains()}                        
            </>
        );
    }
}

export default AdminViewDomains;
