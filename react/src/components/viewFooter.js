import {Component} from "react";
import ViewProgressBar from "./viewProgressBar";
import {CRITICALITY_LOW, CRITICALITY_NORMAL, CRITICALITY_SEVERE} from "../const/message";

class ViewFooter extends Component {

/*
 *          UI
 */

    render() {
        const style = {}
        if (this.props.theme && this.props.theme.webapp && this.props.theme.webapp.color) {
            style.color=this.props.theme.webapp.color.button+" !important";
        }

        return (            
            <div className="siww-footer">
                <div className="credits">©&nbsp;
                    <a className="footer-link" style={style} href="/" target="_blank">Sign with Wallet</a>                                        
                </div>
                <div 
                    className={this.props.criticality === CRITICALITY_SEVERE? "message bold red" : (this.props.criticality === CRITICALITY_SEVERE)? "message bold" : "message"}
                    dangerouslySetInnerHTML={{__html: this.props.message && this.props.message!=="" ? this.props.message : "&nbsp;"}} 
                >
                </div>
                <div className="footer-version">&nbsp;&nbsp;v{this.props.version}</div>
                {this.props.inTimerEffect? 
                    <ViewProgressBar
                    theme = {this.props.theme}
                    id = "myFooterProgressBar"
                    idMessage = {null}
                    inc = {this.props.incEffect}
                    delay = {this.props.delayEffect}
                    callback = {this.props.callback}
                />                            
                :""}
            </div>
        )
    }
}

export default ViewFooter;
