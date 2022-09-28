import {Component} from "react";
class FormAuthenticate extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);
        this.props.aScope.forEach(item => {
            let _obj={};
            _obj[item.property]=item.value;
            this.setState(_obj)
        })
    }
  
    doLogin ( ){
        let eltForm=document.getElementById('form-login');
        if(eltForm) {
            document.cookie = this.props.cookie.name + "=" + this.props.cookie.token + ";path=/";
            document.getElementById('form-login').submit();
        }
    }

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
                            let _obj={};
                            _obj[item.property]=e.target.value;
                            this.setState(_obj)
                        }}
                    />
                ))}

                <button 
                    className="signin-btn btn" 
                    style= {style}
                    onClick = {this.doLogin}
                >
                    Continue
                </button>

            </form>
        )
    }
}

export default FormAuthenticate;
