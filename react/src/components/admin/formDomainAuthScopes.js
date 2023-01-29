import {Component} from "react";

class AdminFormDomainScopes extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    
        this.state = {

            // permission / scopes
            // todo : this is currently harcoded and fixed
            aScope: [{
                label: "Username",
                property: "username"
            }, {
                label: "Wallet Address",
                property: "wallet_address"
            }]
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps.aScope !== this.props.aScope)  {
            this.setState({aScope: this.props.aScope});
        }
    }     

/*
 *          Scopes UI
 */

    render() {
        return(
            <ul className="row-list">
                 {this.state.aScope.map((item, index) => (
                    <li className="row"
                        key={index}
                    >
                        <div className="group">
                            <span className="row-name">Label</span>
                            <span className="row-property">{item.label}</span>
                        </div>
                        <div className="group">
                            <span className="row-name">Property</span>
                            <span className="row-property">{item.property}</span>
                        </div>
                    </li>
                ))}
            </ul>
        )        
    }
}

export default AdminFormDomainScopes;
