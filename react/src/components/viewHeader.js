import {Component} from "react";

class ViewHeader extends Component {

/*
 *      UI 
 */

    _getListOfWallets() {
        let aRet=[];
        if(this.props.aConnector && this.props.aConnector.length>0) {
            this.props.aConnector.forEach(item => {
                item.assets.aAcceptedBlockchain.forEach(chain => {
                    aRet.push({
                        image: chain.image,
                        name: chain.name,
                        symbol: chain.symbol,
                        connector: chain.connector
                    });
                })
            })
        }
        aRet.push({
            image: "symbol_siww.png",
            name: "Wallet",
            symbol: "SIWW",
            connector: "SIWW"
        }, {
            image: "symbol_danger.png",
            name: "Unsupported",
            symbol: "SIWW",
            connector: "SIWW"
        })

        return aRet;
    }

    renderBlockchainImages() {
        return (
            <>
            {this._getListOfWallets().map((item, index) => (   
                <img 
                    className={
                        item.connector===this.props.connector.symbol && 
                        item.name===this.props.connector.assets.blockchain_name && 
                        this.props.connector.isAccepted? "client-login-logo siww": "hidden"} 
                    src={"/assets/images/"+item.image} 
                    alt={"logo "+item.name}
                    key={index}
                ></img>
            ))}
            </>
        )
    }

    render() {
        return (
            <div className={"siww-header "+ (this.props.theme.webapp.dark_mode? this.props.theme.webapp.dark_mode : '')}>
                {this.props.isOauth ?
                <>
                    <div className="display-app-logo">
                        <img className="client-login-logo" src={this.props.theme.webapp.logo} alt="logo" />
                        <div className="login-subtitle">
                            <span>{this.props.oauthClientName !==""? this.props.oauthClientName : "???"}</span>
                            <br />
                            <span>{this.props.oauthDomain !==""? this.props.oauthDomain : "https://???"}</span>
                        </div>
                    </div>

                    <div>
                        <div className="hidden" id="idClient">{this.props.app_id}</div>
                        <div className="login-separator">↔</div>
                        {this.props.is_verified===false? 
                            <div className="red" title="Ownership of this application is not yet confirmed">⚠</div>
                        :""}
                    </div>

                </>
                :""}

                <div className="display-app-logo">
                    <div className="client-login-logo_container">
                        <img className="client-login-logo siww" src="/assets/images/logo_siww_contour.png" alt="siww background"/>

                        <img 
                            className="client-login-logo siww wallet"
                            src={this.props.connector.assets.wallet_logo} 
                            alt={this.props.connector.assets.wallet_name+"wallet logo "}
                        ></img>

                    </div>
                    <div className="login-subtitle">
                        <div className={this.props.connector.isAccepted ?"" : "red"}>{this.props.connector.isAccepted ? "Sign with "+ this.props.wallet : "Unsupported!"}</div>
                        <div>{this.props.connector.assets.blockchain_name}</div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ViewHeader;
