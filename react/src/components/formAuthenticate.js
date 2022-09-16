import {Component} from "react";
class FormAuthenticate extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    
    }
    
/*
 *          UI
 */

    render() {
        return( 
            <form className="hidden" id="form-login" action="/oauth/login" method="POST">
                <input type="text" id="wallet_id" value={this.props.wallet_id}/>
                <input type="text" id="wallet_address" value={this.props.wallet_address}/>
                <input type="text" id="username" value={this.props.username}/>
            </form>
        )
    }
}

export default FormAuthenticate;
