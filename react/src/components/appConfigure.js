import AppAuthenticate from "./appAuthenticate";
import FormConfigure from "./formConfigure";

class AppConfigure extends AppAuthenticate {

/*
 *          page inits
 */

    constructor(props) {
        super(props);

        this.state= Object.assign({}, this.state, {

            theme: this.props.theme, 
        });
    }

    componentDidMount() {
        super.componentDidMount();
    }
    
    componentDidUpdate(prevProps) {
        super.componentDidUpdate(prevProps);
    }

/*
 *          SIWC inits + callbacks
 */

    render() {
        return( 
            <>
                <div className="siww_configure-header">
                    <h1>Sign-in config</h1>
                    <span>Use the form below to claim a domain for authenticating end-users with Sign-in With Wallet.</span>
                </div>

                {this.state.didAccessWallets===false? 
                    <div className="">
                    </div>
                :""}

                <FormConfigure 
                    version={this.props.version}
                    isDebug={this.props.isDebug}
                    theme={this.props.theme} 
                    styles={this.props.styles}
                />
            </>
        );
    }
}

/*
    1. connect with your wallet to prove identity
    2. reserve a domain (will enable claiming it in next 15min)
    3. config domain oAuth access and params
    4. claim the domain
    5. test authentication
*/

export default AppConfigure;
