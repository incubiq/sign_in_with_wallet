import {Component} from "react";

class AppAuthHeader extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    
    }

    componentDidMount() {
    }

/*
 *          
 */

    render() {
        const style = {}
        if (this.props.theme && this.props.theme.color) {
            style.color=this.props.theme.color.button+" !important";
        }

        return (
            
            <div className="siwc-login-footer">
                <div className="login-line client-login-credits"> Powered by &nbsp;
                    <a className="footer-link" style={style} href="/" target="_blank">Sign-in with {this.props.theme.name}</a>                    
                </div>
                <div 
                    className="message"
                    dangerouslySetInnerHTML={{__html: this.props.message}} 
                >
                </div>
            </div>

        )
    }
}

export default AppAuthHeader;
