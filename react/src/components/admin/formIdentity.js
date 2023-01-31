import {Component} from "react";

class FormIdentity extends Component {

/*
 *          UI
 */

    render() {
        return(
            <>
            {this.props.isVisible?
                <>

                {this.props.identity ? 
                <div className="container">
                    <div className="category">
                        <span>You are logged-in </span>
                    </div>

                    <div className="row">

                        <span className="label">Username</span>
                        <input 
                            type = "text"
                            className="value disabled" 
                            value = {this.props.identity.username}
                            disabled = "disabled"
                        />
                    </div>

                    <div className="row">
                            <span className="label">Wallet address</span>
                            <input 
                                type = "text"
                                className="value disabled" 
                                value = {this.props.identity.wallet_address}
                                disabled = "disabled"
                            />
                    </div>

                    <div className="row compulsory">
                            <span className="label">Wallet</span>
                            <img
                                className="icon large"
                                src={this.props.identity.wallet_logo}
                            />
                            <input 
                                type = "text"
                                className="value disabled" 
                                value = {this.props.identity.wallet_name}
                                disabled = "disabled"
                            />
                    </div>

                    <div className="row compulsory">
                            <span className="label">Blockchain</span>
                            <img
                                className="icon large"
                                src={"/assets/images/"+ this.props.identity.blockchain_image}
                            />
                            <input 
                                type = "text"
                                className="value disabled" 
                                value = {this.props.identity.blockchain_name}
                                disabled = "disabled"
                            />
                    </div>
                </div>
                :""}

            </>
            :""}
            </>

        );
    }
}

export default FormIdentity;
