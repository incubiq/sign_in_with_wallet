import {Component} from "react";

class ViewDomain extends Component {

/*
 *          UI
 */

    render() {

        return (            
            <div 
                onClick = {this.props.onClick}
                attr-id = {this.props.app_id}
                attr-index = {this.props.index}
            > 
                <img className="domain-logo" src={this.props.logo ? this.props.logo : ""} alt="logo" />  
                {this.props.isVerified!==null? 
                    <div className="domain-checked">
                        {this.props.isVerified? 
                        <span className="green">✔</span>
                        :
                        <span  className="red" title="Ownership not yet confirmed">⚠</span>
                        }</div>
                :""}
                <div className="domain-name" >{this.props.display_name}</div>
                <div className="domain-url" >{this.props.domain_name}</div>
            </div>
        )
    }
}

export default ViewDomain;
