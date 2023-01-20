import AppBase from "./appBase";
import Cookies from 'js-cookie';
import {deleteMe} from "../services/me";

// class for displaying top banner in admin mode
class AuthBanner extends AppBase {
    
    onDisconnect() {
        // 
        deleteMe();
        Cookies.remove(this.props.AuthenticationCookieName, { path: ''});
        window.location="/auth/login";
    }

/*
 *          Render
 */

    render() {
        return( 
            <>
                <div className="siww_configure-header">
                    <h1><a href="/">Sign with Wallet</a></h1>
                    <div className="align-right">
                        <div className="connected">
                            {this.props.authenticated_wallet_address? 
                            <>
                                <span>Connected with</span>
                                &nbsp;<b>{this.props.authenticated_wallet_id}</b>&nbsp;
                                <span>({this.getShortenAnonAddress(this.props.authenticated_wallet_address)})</span>

                            </>
                            : 
                            <span>Not authenticated</span>
                            }                            
                        </div>

                        {this.props.authenticated_wallet_address? 
                                    <div 
                                    className="btn btn-tiny"
                                    onClick = {this.onDisconnect.bind(this)}
                                >
                                    Disconnect
                                </div>
                            :""}

                    </div>
                </div>

                <div className="siww_warning_banner">Preview version - will be released OFFICIALLY early 2023...</div>        
            </>
        );
    }
}

export default AuthBanner;