import {Component} from "react";
import {srv_reserveDomain} from "../services/configure";

class FormReserve extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    
        this.state={  

            // domain name to reserve...          
            reserve_name: props.domain_name,

            // UI / UX
            canValidate: false,
        }
    }

/*
 *          Data entry validation
 */

    validateDomain(url) {
        //remove all http:// or https:// in front...
        url = url.toLowerCase();
        if (url.substr(0, 7) === "http://") {
            url = url.substr(7, url.length);
        } else {
            if (url.substr(0, 8) === "https://") {
                url = url.substr(8, url.length);
            }
        }

        var re = new RegExp(/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/);
        if (url.match(re) || url === "localhost") {
            if (url.split(".").length-1 === 1) {
                return url;
            }
        }
        return null;
    }
 
    updateCanValidateReserve(_input) {
        let isDomainOK = this.validateDomain(_input)!==null;
        this.setState({canValidate: isDomainOK});
    }

/*
 *          UI
 */

    async async_reserveDomain() {
        let objConfig = {            
            domain_name: this.state.reserve_name,
        };

        return await srv_reserveDomain(objConfig);
    }

    renderRow(objParam)  {
        let that=this;
        return (
            <div className={"row"  +(objParam.isCompulsory===true ? " compulsory" : "") }>
                <div
                    className="label"
                >{objParam.label}</div>

                <img
                    id={"icon_"+objParam.id} 
                    className="icon"
                    src="./assets/images/icon_compulsory.png"
                />

                <input 
                    type={objParam.type} 
                    className="value "
                    id={objParam.id} 
                    disabled={objParam.isDisabled===true? "disabled": ""}
                    value={that.state[objParam.id]}
                    placeholder = {objParam.placeholder}
                    onChange={(e) => {
                        let _eltIcon=document.getElementById("icon_"+objParam.id);
                        let _defOnchange=function(_e) {
                            let _obj={};
                            _obj[objParam.id] = _e.target.value;
                            that.setState(_obj);
                            let _isValid=objParam.fnValidate(_e.target.value);
                            if(_e.target.value!=="") {
                                _eltIcon.src=_isValid? "./assets/images/icon_check.png" : "./assets/images/icon_warning.png"
                            }
                            else {
                                _eltIcon.src="./assets/images/icon_compulsory.png"
                            }
                        }

                        objParam.onChange? objParam.onChange(e) : _defOnchange(e)
                    }}
                />

                <div
                    className="hint"
                >
                    {objParam.hint}
                </div>
            </div>
        )
    }

    renderFormReserve() {
        let that=this;
        return( <>
            <div className="siww_configure-body">
                <div  
                    className="siww_configure"
                    id="form-reserve"
                >

                    <div className="category">
                        Which domain would you like to configure?
                    </div>

                    {this.renderRow({
                        id: "reserve_name", 
                        type: "text", 
                        label: "Domain", 
                        hint: "Enter the domain name of your web app.", 
                        placeholder: "mydomain.com",
                        isCompulsory: true,
                        fnValidate: function (_input) {that.updateCanValidateReserve(_input); return that.validateDomain(_input);}
                    })}

                    <div 
                        className={"btn btn-primary " + (this.state.canValidate? "" : "disabled")}
                        onClick = {this.async_reserveDomain.bind(this)}
                    >
                        Configure this domain!
                    </div>

                </div>


            </div>

        </>
        )
    }

    render() {
        return (<></>)
    }
}

export default FormReserve;
