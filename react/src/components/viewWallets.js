import {Component} from "react";
import ViewWalletConnect from "./viewWalletConnect";

class ViewWallets extends Component {

/*
 *          UI
 */

    // Params: aWallet: [], onSelect: fn...
    renderListOfWallets(objParam) {
        return (
            <>
                <div className="siww-oauth-legend">
                    <div className="legendSquare connected"></div>
                    <div className="legendText">Connected</div>
                    <div className="legendSquare disconnected"></div>
                    <div className="legendText">Disconnected</div>
                </div>

                <div className = "connectCont">
                    <ul className = "connectWallets">
                        {objParam.aWallet.map((item, index) => (
                            <ViewWalletConnect 
                                theme = {this.props.theme}
                                wallet_id = {item.id}
                                isConnected = {item.hasConnected}
                                address = {item.address}
                                logo = {item.logo}
                                onConnect={objParam.onSelect}
                                fnShowMessage={this.props.fnShowMessage}
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

        return (            
            <>
                {this.props.aWallet.length>0?
                <> 
                    {this.renderListOfWallets({
                        aWallet: this.props.aWallet,
                        onSelect: this.props.onSelect,
                        onHover: this.props.onHover
                    })}
                </>
                : ""}
            </>
        )
    }
}

export default ViewWallets;
