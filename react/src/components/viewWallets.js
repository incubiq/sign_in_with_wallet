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
                <div className="siwc-oauth-legend">
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
        let style = {}
        if (this.props.theme && this.props.theme.webapp && this.props.theme.webapp.color) {
            style.color=this.props.theme.webapp.color.button+" !important";
        }

        return (            
            <div className="siwc-oauth-datashare">
            {this.props.aWallet.length>0? 
                <>
                    <div className="siwc-oauth-section">
                        <strong>Sign-in with {this.props.theme.name}</strong> has detected {this.props.aWallet.length===1? "one wallet:" : "those wallets:"} 
                    </div>

                    {this.renderListOfWallets({
                        aWallet: this.props.aWallet,
                        onSelect: this.props.onSelect,
                        onHover: this.props.onHover
                    })}
                </>
            :
                <div className="transitoryMessage">
                    Could not detect a single wallet from this browser
                    <br />
                    <br />
                    You must use at least one {this.props.theme.name} wallet extension
                </div>
            }
            </div>
        )
    }
}

export default ViewWallets;
