import React, {Component} from "react";

class DialogOwnership extends Component {

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
                        <h2>Prove ownership</h2>
                        
                        <div className="siww-panel left">
                            <div className="siw-section">
                                <div>Enter the following DNS entry, then press validate.</div>
                                <div className="hint">A new value is issued each time you request this confirmation dialog. You must validate the latest entry once within 30 minutes.</div>
                                <br />
                            </div>

                            <div className="row">
                                <div className="label">DNS Record Type</div>
                                <input type="text" className="value " disabled="disabled" value="TXT" />
                                <div className="hint">you must add a TXT DND record in your DNS configuration (ask your website admin)</div>
                            </div>

                            <div className="row">
                                <div className="label">Entry</div>
                                <input type="text" className="value " disabled="disabled" value={this.props.domain_name} />
                                <div className="hint">this is the name of the TXT record to add</div>
                            </div>

                            <div className="row">
                                <div className="label">value</div>
                                <input type="text" className="value " disabled="disabled" value={"siww="+this.props.dns_token} />
                                <div className="hint">copy this value into the content of your TXT record</div>
                            </div>

                            <div className="align-center">
                                <div 
                                    className="btn btn-primary "
                                    onClick = {( )=> this.props.onValidate()}
                                >                                
                                    Validate
                                </div>

                                <div 
                                    className="btn btn-quiet "
                                    onClick = {this.props.onClose}
                                >                                
                                    Cancel
                                </div>

                            </div>
                        </div>

                        <div class="siww-footer">
                            <div class="credits"></div>
                            <div class="message">{this.props.message}</div>
                        </div>
                    </div>

                </div>

            </>
        )
    }
}

export default DialogOwnership;
