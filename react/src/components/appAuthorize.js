import AppAuthenticate from "./appAuthenticate";
import AppAuthHeader from "./appAuthHeader";
import AppAuthFooter from "./appAuthFooter";
import AppAuthWalletConnect from "./appAuthWalletConnect";

import {registerWebAppWithIdentity, getMyIdentities} from "../services/me";

class AppAuthorize extends AppAuthenticate {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    

        let scope=decodeURIComponent(decodeURIComponent(this.getmyuri("scope", window.location.search)));
        let aScope=JSON.parse(scope);
        let aId=getMyIdentities();
        
        // make sure WebApp is registered for each known identity of this user...
        aId.forEach(item=> {
            registerWebAppWithIdentity(item.username, {
                client_id: this.state.client_id,
                scope: aScope
            });    
        })

        this.state= Object.assign({}, this.state, {
            aScope: aScope,
            aIdentity: aId,
            iSelectedIdentity: 0
        });

        this._setSharedIdentity(0);
    }

/*
 *          Store user info
 */

    onSIWCNotify_WalletsAccessible(_aWallet) {
        // we cannot let the authenticate parent do Auth in the background...
        return;
    }

    onSIWCNotify_WalletConnected(objParam) {
        // we cannot let the authenticate parent do Auth in the background...
        return;
    }

    async async_onAuthCookieReceived(cookie) {
        await super.async_onAuthCookieReceived(cookie);

        // update known identities...
        let aId=getMyIdentities();
        this.setState({aIdentity: aId});
    }

/*
 *          UI
 */

    onHover(event, bOver) {
        // who's there?
        let idElt=event.currentTarget;
        let _id=idElt.getAttribute("attr-id");
        try {
            let i=this.state.aIdentity.findIndex(function (x) {return x.wallet_id===_id});
            if(i!==-1) {
                if(bOver && i!==this.state.iSelectedIdentity) {
                    this.setState({hover:"Click to preview shared data from your <strong>"+this.state.aIdentity[i].wallet_id+"</strong> wallet's identity."});
                }
                else {
                    this._setSharedIdentity(this.state.iSelectedIdentity);
                }
            }
        }
        catch(err) {
        }        
    }

    getCondensedText(_str) {
        if(!_str) {return "";}
        if(_str.length<=10) return _str;
        return _str.substring(0,10)+"..."+_str.substring(_str.length,_str.length-4);
    }

    onReAuthenticate ( ){
        this.props.onRedirect("/app/authenticate?client_id=" + this.state.client_id+"&domain="+this.state.oauthDomain+"&name="+this.state.oauthClientName);
    }

    _setSharedIdentity(_iSel) {
        // update data with this selection
        if(_iSel!==-1) {
            if(_iSel!==this.state.iSelectedIdentity) {
                this.setState({iSelectedIdentity: _iSel});
            }
            this.setState({hover:"You will share data taken from your <strong>"+this.state.aIdentity[_iSel].wallet_id+"</strong> identity"});
        }
    }
    
    onChangeIdentity(event) {
        // who's there?
        let idElt=event.currentTarget;
        let _id=idElt.getAttribute("attr-id");

        // css 
        let aEltId=document.getElementsByClassName("wallet-sign");
        for(var i=0; i<aEltId.length; i++) {
            aEltId[i].className ="wallet-sign connected";
        }
        idElt.className="wallet-sign connected selected";

        let _iSel=this.state.aIdentity.findIndex(function (x) {return x.wallet_id===_id});
        this._setSharedIdentity(_iSel);
    }

    // Params: aIdentity: [], selWallet_id: <> , onSelect: fn...
    renderListOfIdentities(objParam) {
        return (
            <>
                <div className="siwc-oauth-legend">
                    <div className="legendSquare connected"></div>
                    <div className="legendText">Connected</div>
                    <div className="legendSquare selected"></div>
                    <div className="legendText">Selected</div>
                </div>

                <div className = "connectCont">
                    <ul className = "connectWallets">
                        {objParam.aIdentity.map((item, index) => (
                            <AppAuthWalletConnect 
                                theme = {this.state.theme}
                                client_id = {this.state.client_id}
                                wallet_id = {item.wallet_id}
                                isConnected = {true}
                                isSelected = {index===this.state.iSelectedIdentity}
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
        return(
            <div id="siwc-login-container" style={this.state.styles.container}>
                <div className={"modal-login center-vh" + (this.state.theme.dark_mode ? "dark-mode": "")} style={this.state.styles.color}>

                    <AppAuthHeader 
                        client_id= {this.state.client_id}
                        oauthClientName = {this.state.oauthClientName}
                        oauthDomain = {this.state.oauthDomain}
                        isOauth = {true}
                        SIWCLogo = "/assets/images/siwc_logo.png"
                        theme = {this.state.theme}
                    />

                    {this.state.aIdentity.length>0?
                        <div className={"login-line login-line-emph" + (this.state.theme.dark_mode ? "dark-mode": "")}>

                            <div className="siwc-oauth-section">
                                <strong>{this.state.oauthClientName}</strong> is requesting access to those data:
                            </div>

                            <ul className="scopes-list">
                                {this.state.aScope.map((item, index) => (  
                                    <li key={index}>
                                        <span className="scope-name">{item.text}</span>
                                        <span className={"scope-value "+item.value} id={"scope_"+item.value}>
                                            { this.getCondensedText(this.state.aIdentity[this.state.iSelectedIdentity][item.value]) }
                                        </span>
                                    </li>
                                ))}
                            </ul>


                            <div className="siwc-oauth-section">
                                Select identity to grant data share from:
                            </div>

                            {this.renderListOfIdentities({
                                aIdentity: this.state.aIdentity,
                                iSel: this.state.iSelectedIdentity, 
                                onSelect: this.onChangeIdentity.bind(this),
                                onHover: this.onHover.bind(this),
                            })}

                            <div className="identity_action">
                                <button 
                                    className="btn btn-quiet"
                                    onClick={evt => {
                                    }}
                                >
                                    Add identities...
                                </button>

                                <button 
                                    className="btn btn-quiet"
                                    onClick={evt => {
                                    }}
                                >
                                    Grant Access!
                                </button>
                            </div>

                        </div>                
                    : 
                    <div className={"login-line login-line-emph" + (this.state.theme.dark_mode ? "dark-mode": "")}>
                        <div className="siwc-oauth-login">
                            Who are you? Cannot find your identity...
                        </div>
                        <br />
                        <button 
                            className="btn btn-quiet"
                            onClick={evt => {
                                this.onReAuthenticate(evt); 
                            }}
                        >
                            Re-Authenticate!
                        </button>
                    </div>
                    }
                    <AppAuthFooter 
                        theme = {this.state.theme}
                        message = {this.state.hover}
                    />

                </div>
            </div>
        )
    }
}

export default AppAuthorize;
