import {Component} from "react";

let isMounted=false;
class ViewWalletConnect extends Component {

/*
 *      Inits
 */
    
    constructor(props) {
        super(props);    
        this.state={            
            isConnecting: false
        }
    }

    componentDidMount() {
        isMounted=true;
    }

    componentWillUnmount() {
        isMounted=false;
    }

/*
 *      UI
 */

    async async_onConnect(event) {
        if(this.props.onConnect) {

            // who's there?
            let idElt=event.currentTarget;
            let _id=idElt.getAttribute("attr-id");
            
            // waiting/loading effect
            if(isMounted) {
                this.setState({isConnecting: true});
                if(this.props.fnShowMessage) {
                    this.props.fnShowMessage({
                        message: "Connecting to your <b>"+_id+"</b> wallet...", 
                        hasTimerEffect: true
                    });
                }    
            }

            await this.props.onConnect(_id);

            if(isMounted) {
                this.setState({isConnecting: false});
                if(this.props.fnShowMessage) {
                    this.props.fnShowMessage({
                        message: "Connected to your <b>"+_id+"</b> wallet...", 
                        hasTimerEffect: false
                    });
                }
            }
        }
    }

    onHover(event, bOver) {
        // who's there?
        let idElt=event.currentTarget;
        let _id=idElt.getAttribute("attr-id");
        let msg=null;
        
        if(_id && bOver && this.props.fnShowMessage && !this.state.isConnecting) {
            msg=this.props.isConnected ? 
                "Click to choose <strong>"+_id+"</strong> wallet as the signing identity."
                : "Click to add <strong>"+_id+"</strong> wallet as a signing identity.";
        }

        if(msg) {
            this.props.fnShowMessage({message: msg});
        }
    }

    render() {
        const style = {}
        if (this.props.theme && this.props.theme.color) {
            style.color=this.props.theme.color.button_text+" !important";
            style.background=this.props.theme.color.button+" !important";
        }

        return (    
            <li 
                id={"btnLoginWithWallet_"+ this.props.wallet_id}
                attr-id={this.props.wallet_id}
                key={this.props.index}
                className={"wallet-sign" + (this.props.isSelected? " selected " : this.props.isConnected? " connected" : " ")} 
                style={style} 
                onClick={evt => {this.async_onConnect(evt)} }
                onMouseOver={evt => {this.onHover(evt, true) }}
                onMouseLeave={evt => {this.onHover(evt, false) }}
            >
                <div className={"connectWalletLogoContainer" + (this.state.isConnecting? " connecting": "")}> 
                    {this.state.isConnecting? 
                        <div className="connectWalletLogo connecting">⌛</div>  
                    :
                    <>
                        <img className="connectWalletLogo" src={this.props.logo ? this.props.logo : ""} alt="logo" />  
                        <div className="connectWalletTitle" >{this.props.wallet_id}</div>
                    </>
                    }
                </div>
            </li>
        )
    }
}

export default ViewWalletConnect;
