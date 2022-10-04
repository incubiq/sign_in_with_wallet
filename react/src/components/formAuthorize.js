import {Component} from "react";

class FormAuthorize extends Component {

/*
 *          UI
 */

    render() {
        let style = {}
        if (this.props.theme && this.props.theme.webapp.color) {
            style.color=this.props.theme.webapp.color.button_text+" !important";
            style.background=this.props.theme.webapp.color.button+" !important";
        }

        return( 
            <form  id="form-login" action="/oauth/login" method="POST">

                {this.props.aScope.map((item, index) => (  
                    <input key={index}
                        type="text" 
                        className="hidden"
                        id={item.property} 
                        value={item.value}
                        onChange={(e) => {
                            // no change
                        }}
                    />
                ))}

                <input 
                    type="text" 
                    className="hidden"
                    id="client_id" 
                    value={this.props.client_id}
                    onChange={(e) => {
                        // no change
                    }}
                />

                <button 
                    className="btn btn-quiet" 
                    style= {style}
                    onClick = {this.doLogin}
                >
                    Continue
                </button>

            </form>
        )
    }
}

export default FormAuthorize;