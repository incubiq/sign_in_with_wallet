import {Component} from "react";
import {getConnectors} from "../../const/connectors"; 

class FormAbout extends Component {

    constructor(props) {
        super(props);    
        let objC=getConnectors();
        this.state = {
            aConnectors: objC.aConnector,
            allConnectors: objC,
        }
    }

/*
 *          UI
 */

    render() {
        return(
            <>
            {this.props.isVisible?

                <div className="container">
                    <h2>About Sign with Wallet</h2>

                    <div className="row">
                        <span className="label">version</span>
                        <span className="value">{this.props.version}</span>
                    </div>

                    <div className="category">
                        <span>Connectors </span>
                    </div>
                    
                    {this.state.aConnectors.map((item, index) => (
                        <div 
                            className="row compulsory" 
                            key={index}
                        >
                            <span className="label">{"#"+(index+1)}</span>
                            <img
                                className="icon large"
                                src={this.state.allConnectors[item].wallet_logo}
                            />
                            <span className="value">{this.state.allConnectors[item].wallet_name}</span>
                        </div>
                    ))}

                </div>

            : ""}
        </>
        );
    }
}

export default FormAbout;
