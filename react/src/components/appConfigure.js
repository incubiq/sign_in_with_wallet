import AppLogged from "./appLogged";
import FormConfigure from "./formConfigure";

class AppConfigure extends AppLogged {

/*
 *          page inits
 */

    constructor(props) {
        super(props);

        this.state= Object.assign({}, this.state, {
            claimed_domain: ""

        });
       
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

                {!this.state.authenticated_wallet_address? 
                    <>
                        {this.renderToolbar()}                        
                    </>
                :
                <FormConfigure 
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                        onRedirect={this.props.onRedirect}
                        fnShowMessage={this.showMessage.bind(this)}

                        theme={this.props.theme} 
                        styles={this.props.styles}
                        isPreview={this.state.isPreview}

                        domain_name= {this.state.claimed_domain}
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

export default AppConfigure;
