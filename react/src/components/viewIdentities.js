import {Component} from "react";
import ViewWalletConnect from "./viewWalletConnect";

class ViewIdentities extends Component {

/*
 *          UI
 */

    // Params: aIdentity: [], selWallet_id: <> , onSelect: fn...
    renderListOfIdentities(objParam) {
        return (
            <>
                <div className="siwc-oauth-legend">
                    <div className="legendSquare selected"></div>
                    <div className="legendText">Selected</div>
                    <div className="legendSquare disconnected"></div>
                    <div className="legendText">Available</div>
                </div>

                <div className = "connectCont">
                    <ul className = "connectWallets">
                        {objParam.aIdentity.map((item, index) => (
                            <ViewWalletConnect 
                                theme = {this.props.theme}
                                wallet_id = {item.wallet_id}
                                isSelected = {index===this.props.iSelectedIdentity}
                                address = {item.wallet_address}
                                logo = {item.wallet_logo}
                                onConnect={objParam.onSelect}
                                onHover={objParam.onHover}
                                index = {index}
                                key={index}
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
            <div className="siwc-oauth-datashare">
                <div className="siwc-oauth-section">
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
