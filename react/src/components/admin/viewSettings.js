import AdminViewBase from "./viewBase";
import ViewIdentitySelect from "../viewIdentitySelect";

class AdminViewSettings extends AdminViewBase {

/*
 *          page inits
 */


/*
 *        UI
 */
 
    renderIdentities() {
        return (
            <>
                <div className="siww-section">
                    <h2>Your known identities</h2>
                </div>
                <div className="connectCont align-left">
                    <ul className="connectWallets"> 
                        {this.state.aIdentity.map((item, index) => (
                            <ViewIdentitySelect 
                                theme = {this.props.theme}
                                wallet_id = {item.wallet_id}
                                wallet_name = {item.wallet_name}
                                wallet_logo = {item.wallet_logo}
                                blockchain_image = {item.blockchain_image}
                                blockchain_name = {item.blockchain_name}
                                isSelected = {index===this.state.iSelectedIdentity}
                                address = {item.wallet_address}
                                onConnect={this.onSelectIdentity.bind(this)}
                                onHover={() => {}}
                                index = {index}
                                key={index}
                            />
                        ))}
                    </ul>
                </div>
            </>);
    }

    renderContent() {
        return( 
            <>
                <div className="connected">
                    {this.state.user && this.state.user.wallet_address? 
                    <>
                        <span>Connected with</span>
                        &nbsp;<b>{this.state.user.wallet_id}</b>&nbsp;
                        <span>({this.getShortenAnonAddress(this.state.user.wallet_address)})</span>

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

                {this.renderIdentities()}           
            </>
        );
    }
}

export default AdminViewSettings;
