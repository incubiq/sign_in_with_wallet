import React, {Component} from "react";

class DialogSecret extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    
        this.state= {
            
        };
    }

    render() {
        return (
            <>
                <div className="modalContainer blur"></div>

                <div className="modalContainer">
                    <div className="modal modal-login center-vh" >
                        <h2>App information</h2>
                        
                        <div className="siww-panel left">
                            <div className="row">
                                <div className="label">Domain</div>
                                <input type="text" className="value " disabled="disabled" value={this.props.domain_name} />
                                <div className="hint">the domain you are claiming</div>
                            </div>

                            <div className="row">
                                <div className="label">App ID</div>
                                <input type="text" className="value " disabled="disabled" value={this.props.app_id} />
                                <div className="hint">the app_id for this domain</div>
                            </div>

                            <div className="row">
                                <div className="label">App Secret</div>
                                <input type="text" className="value " disabled="disabled" value={this.props.app_secret} /> 
                                <div className="hint">the app_secret for this domain (keep it safe)</div>
                            </div>
                        </div>
                        <>
                            <div 
                                className="btn btn-quiet "
                                onClick = {this.props.onClose}
                            >                                
                                Cancel
                            </div>

                        </>
                    </div>

                </div>

            </>
        )
    }
}

export default DialogSecret;
