import AdminViewBase from "./adminViewBase";
import AdminFormConfigure from "./adminFormConfigure";

class AdminViewConfigure extends AdminViewBase {

/*
 *          page inits
 */

    constructor(props) {
        super(props);

        this.state= Object.assign({}, this.state, {
            claimed_domain:  props.webAppDomain?  props.webAppDomain : null,
            app_id: props.webAppId ? props.webAppId : null

        });
       
    }

    
    componentDidUpdate(prevProps) {
        if(prevProps.webAppId !== this.props.webAppId) {
            this.setState({app_id: this.props.webAppId});
        }
        if(prevProps.webAppDomain !== this.props.webAppDomain) {
            this.setState({claimed_domain: this.props.webAppDomain});
        }
    }

/*
 *        App Configure Renders 
 */

    renderToolbar() {
        return (
        <div className="toolbar">
            <div 
                className="btn btn-tiny"
                onClick = {( )=> {this.props.onRedirect("/app")}}
            >
                &lt;&lt; Back to Admin panel
            </div>        

        </div>      
        );
    }

    render() {
        return( 
            <>
                {this.renderHeader()}

                {!this.state.user || !this.state.user.wallet_address? 
                    <>
                        {this.renderToolbar()}                        
                    </>
                :
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
                }
                
                {this.renderFooter()}
            </>
        );
    }
}

/*
    1. reserve a domain (will enable claiming it in next 15min)
    2. config domain oAuth access and params
    3. claim the domain
    4. test authentication
*/

export default AdminViewConfigure;
