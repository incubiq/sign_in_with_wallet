import {Component} from "react";
import ViewProgressBar from "./viewProgressBar";

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
            <div className="siwc-footer">
                <div className="credits">©&nbsp;
                    <a className="footer-link" style={style} href="/" target="_blank">Sign-in with {this.props.theme.name}</a>                    
                    <span className="footer-version">&nbsp;&nbsp;v{this.props.version}</span>
                </div>
                <div 
                    className="message"
                    dangerouslySetInnerHTML={{__html: this.props.message}} 
                >
                </div>
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
