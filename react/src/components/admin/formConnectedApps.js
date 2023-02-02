import {Component} from "react";

class FormConnectedApps extends Component {

/*
 *          UI
 */

    render() {
        return(
            <>
            {this.props.isVisible?

                <div className="container">
                    <h2>Your connected Apps</h2>
                    
                    <div className="category">
                        <span>Connected Apps </span>
                    </div>

                    <div className="row">
                        <span className="label">#connections</span>
                        <span className="value">{this.props.aApps.length}</span>
                    </div>
                    
                    {this.props.aApps.map((item, index) => (
                        <div 
                            className="row" 
                            key={index}
                        >
                            <span className="label">App domain</span>
                            <input 
                                type = "text"
                                className="value disabled" 
                                value = {item.name}
                                disabled = "disabled"
                            />
                        </div>
                    ))}

                </div>

            : ""}
        </>
        );
    }
}

export default FormConnectedApps;
