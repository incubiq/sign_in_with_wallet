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

    render() {
        return( 
            <>
                {this.renderHeader()}

                <div 
                    className="btn btn-tiny"
                    onClick = {( )=> {this.props.onRedirect("/app")}}
                >
                    &lt;&lt; Back to Admin panel
                </div>        
                
                {!this.state.authenticated_wallet_address? 
                    <div>
                        You are not logged in...
                    </div>
                :
                    <FormConfigure 
                        version={this.props.version}
                        isDebug={this.props.isDebug}

                        theme={this.props.theme} 
                        styles={this.props.styles}

                        domain_name= {this.state.claimed_domain}
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
