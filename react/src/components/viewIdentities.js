import {Component} from "react";
import ViewIdentitySelect from "./viewIdentitySelect";

class ViewIdentities extends Component {

/*
 *          UI
 */

    // Params: aIdentity: [], selWallet_id: <> , onSelect: fn...
    renderListOfIdentities(objParam) {
        return (
            <>
                <div className="siww-oauth-legend">
                    <div className="legendSquare selected"></div>
                    <div className="legendText">Selected</div>
                    <div className="legendSquare disconnected"></div>
                    <div className="legendText">Available</div>
                </div>

                <div className = "connectCont">
                    <ul className = "connectWallets">
                        {objParam.aIdentity.map((item, index) => (
                            <ViewIdentitySelect 
                                theme = {this.props.theme}
                                wallet_id = {item.wallet_id}
                                wallet_name = {item.wallet_name}
                                wallet_logo = {item.wallet_logo}
                                isSelected = {index===this.props.iSelectedIdentity}
                                address = {item.wallet_address}
                                blockchain_image = {item.blockchain_image}
                                blockchain_name = {item.blockchain_name}
                                onConnect={objParam.onSelect}
                                onHover={objParam.onHover}
                                index = {index}
                                key={index}
                                fnShowMessage={this.props.fnShowMessage}
                            />
                        ))}
                    </ul>
                </div>
            </>
        )
    }

    render() {
        let style = {}
        if (this.props.theme && this.props.theme.webapp && this.props.theme.webapp.color) {
            style.color=this.props.theme.webapp.color.button+" !important";
        }

        return (            
            <div className="siww-oauth-datashare">
                <div className="siww-section">
                    Select identity to grant data share from:
                </div>                        

                {this.renderListOfIdentities({
                    aIdentity: this.props.aIdentity,
                    iSel: this.props.iSelectedIdentity, 
                    onSelect: this.props.onSelect,
                    onHover: this.props.onHover,
                })}

            </div>

        )
    }
}

export default ViewIdentities;
