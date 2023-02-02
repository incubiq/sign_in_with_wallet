import {Component} from "react";
import {deleteMeAdmin} from "../../services/me";
import {WidgetLoading} from "../../utils/widgetLoading"; 

class FormIdentity extends Component {

/*
 *          UI
 */

    onLogout() {
        // 
        deleteMeAdmin();

        // redirect to a logout...
        window.location="/admin/logout";
    }

    render() {
        return(
            <>
            {this.props.isVisible?
                <>

                {this.props.identity ? 
                <div className="container">
                    <h2>Your identities</h2>

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

                    <div 
                        className={"btn btn-tiny  btn-primary "}
                        onClick = {this.onLogout.bind(this)}
                    >                                
                        Logout
                    </div>

                </div>
                :
                    <WidgetLoading 
                        isVisible = {true}
                        fullHeight = {true}
                        text = "Loading your profile, just a moment..."
                    />
                }

            </>
            :""}
            </>

        );
    }
}

export default FormIdentity;
