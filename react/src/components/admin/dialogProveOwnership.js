import React, {Component} from "react";
import {srv_verifyDNS} from "../../services/configure";
import {CRITICALITY_SEVERE, CRITICALITY_NORMAL} from "../../const/message";

class AdminDialogProveOwnership extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);            
        this.state= {
            message: "",
            criticality: CRITICALITY_NORMAL
        };
    }

    componentDidUpdate(prevProps) {
        if(prevProps.isVisible===false && this.props.isVisible) {
            this.setState({
                message: "Validate this DNS record to prove ownership",
                criticality: CRITICALITY_NORMAL
            });
        }
    }
    

/*
 *          UI
 */

    async async_verifyDomain() {
        let dataDomain=await srv_verifyDNS(this.props.app_id, this.props.AuthenticationCookieToken);
        if(dataDomain && dataDomain.data) {
            if(dataDomain.data.is_verified) {
                this.props.onClose(true);
            }
            else {
                this.setState({
                    message: "Could not verify, please check your DNS!",
                    criticality: CRITICALITY_SEVERE
                });
            }
        }
        else {
            this.setState({
                message: dataDomain.message,
                criticality: CRITICALITY_SEVERE
            });
        }
    }

    render() {
        return (
            <>
            {this.props.isVisible? 
            <>
                <div className="modalContainer blur"></div>
        
                <div className="modalContainer">
                    <div className="dialog modal center-vh" >
                        <div className="header">
                            <h2>Prove ownership</h2>
                        </div>
                        
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
                                <div className="hint">this is the Name of the TXT record to add</div>
                            </div>

                            <div className="row">
                                <div className="label">Value</div>
                                <input type="text" className="value " disabled="disabled" value={"siww="+this.props.dns_token} />
                                <div className="hint">copy this value into the Content of your TXT record</div>
                            </div>

                            <div className="align-center">
                                <div 
                                    className="btn btn-tiny  btn-primary "
                                    onClick = {() => this.async_verifyDomain()}
                                >                                
                                    Validate
                                </div>

                                <div 
                                    className="btn btn-tiny btn-quiet "
                                    onClick = {() => this.props.onClose(false)}
                                >                                
                                    Cancel
                                </div>

                            </div>
                        </div>

                        <div className="siww-footer">
                            <div className="credits"></div>
                            <div className={"message "+ (this.state.criticality===CRITICALITY_SEVERE? "red bold" : "")}>{this.state.message}</div>
                        </div>
                    </div>        
                </div>                
            </>
            :""}

            </>
        )
    }
}

export default AdminDialogProveOwnership;
