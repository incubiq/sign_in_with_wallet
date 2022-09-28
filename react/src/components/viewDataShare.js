import {Component} from "react";

class ViewDataShare extends Component {

/*
 *          UI
 */
    getCondensedText(_str) {
        if(!_str) {return "";}
        if(_str.length<=10) return _str;
        return _str.substring(0,10)+"..."+_str.substring(_str.length,_str.length-4);
    }

    render() {
        let style = {}
        if (this.props.theme && this.props.theme.webapp && this.props.theme.webapp.color) {
            style.color=this.props.theme.webapp.color.button+" !important";
        }

        return (            
            <div className="siwc-oauth-datashare">
                <div className="siwc-oauth-section">
                    <strong>{this.props.oauthClientName}</strong> will receive those data from your <strong>{this.props.aIdentity[this.props.iSelectedIdentity].wallet_id}</strong> identity
                </div>

                {this.props.aIdentity.length>1?
                    <div className="siwc-oauth-legend">
                    </div>
                :
                ""}

                <ul className="scopes-list">
                    {this.props.aScope.map((item, index) => (  
                        <li key={index}>
                            <span className="scope-name">{item.label}</span>
                            <span className={"scope-value "+item.property} id={"scope_"+item.property}>
                                { this.getCondensedText(this.props.aIdentity[this.props.iSelectedIdentity][item.property]) }
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }
}

export default ViewDataShare;
