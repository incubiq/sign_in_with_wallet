import {Component} from "react";
import {srv_reserveDomain} from "../../services/configure";

class AdminFormReserve extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    
        this.state={  

            // domain name to reserve...          
            reserve_name: props.domain_name ? props.domain_name : "",

            // UI / UX
            canValidate: false,
            hasUpdated: false
        }
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps) {

        // reset state
        if(this.state.canValidate && this.state.reserve_name==="") {
            this.setState({canValidate: false})
        }
    }

/*
 *          Data entry validation
 */

    _getUrlWithoutHttp(url) {
        if(!url) {return null}

        //remove all http:// or https:// in front...
        url = url.toLowerCase();
        if (url.substr(0, 7) === "http://") {
            url = url.substr(7, url.length);
        } else {
            if (url.substr(0, 8) === "https://") {
                url = url.substr(8, url.length);
            }
        }
        return url;
    }

    validateUrl(url){
        if(!url) {return false}
        url=this._getUrlWithoutHttp(url);
        let bIsOK=url==="localhost" || /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(url);
        return bIsOK;
    }

    validateDomain(url) {
        if(!url) {return null}
        url=this._getUrlWithoutHttp(url);

        var re = new RegExp(/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/);
        if (/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(url)) {
            return url;
        }
        
        if(url === "localhost" || url.substr(0,10) === "localhost:") {
            return url;
        }
        return null;
    }
 
    enableReserveForm(_input) {
        let isDomainOK = this.validateDomain(_input)!==null;
        this.setState({canValidate: isDomainOK});
    }

/*
 *          UI
 */

    async async_reserveDomain() {
        let objConfig = {            
            domain_name: this.state.reserve_name
        };

        let dataReserve = await srv_reserveDomain(objConfig, this.props.AuthenticationCookieToken);
        if(dataReserve && dataReserve.data) {
            this.props.onReserveApp(dataReserve.data);
        }
    }

    changeIcon(_value, _isValid, eltId) {
        let _eltIcon=document.getElementById(eltId);
        if(_value!=="") {
            _eltIcon.src=_isValid? "/assets/images/icon_check.png" : "/assets/images/icon_warning.png"
        }
        else {
            _eltIcon.src="/assets/images/icon_warning.png"
        }
    }

    renderRow(objParam)  {
        let that=this;
        return (
            <div className={"row"  +(objParam.isCompulsory===true ? " compulsory" : "") }>
                <div
                    className="label"
                >{objParam.label}</div>

                {objParam.fnValidate? 
                    <img
                        id={"icon_"+objParam.id} 
                        className="icon"
                        src={
                            that.state[objParam.id]===""? "/assets/images/icon_warning.png": 
                            objParam.fnValidate(that.state[objParam.id]) ? "/assets/images/icon_check.png" : 
                            "/assets/images/icon_warning.png"}
                    />
                : ""}

                <input 
                    type={objParam.type} 
                    className="value "
                    id={objParam.id} 
                    disabled={objParam.isDisabled===true? "disabled": ""}
                    value={that.state[objParam.id]? that.state[objParam.id]: ""}
                    placeholder = {objParam.placeholder}
                    onChange={(_event) => {
                        let _obj={};
                        _obj[objParam.id] = _event.target.value;
                        that.setState(_obj);
                        if(objParam.fnValidate) {
                            let _isValid=objParam.fnValidate(_event.target.value);
                            that.changeIcon(_event.target.value, _isValid, "icon_"+objParam.id);    
                        }
                        that.setState({hasUpdated: true});
                        
                        // enable form button?
                        if(objParam.fnEnableForm) {
                            objParam.fnEnableForm(_event.target.value);
                        }
                    }}
                />
                <div
                    className="hint align-left"
                >
                    {objParam.hint}
                </div>

            </div>
        )
    }

    renderToolbar( ){
        return (
            <div className="toolbar">

                <div 
                    className={"btn btn-tiny right btn-primary "}
                    onClick = {this.props.onClickExit}
                >                                
                    ❌ Exit
                </div>
                            
            </div>      
        );
    }


    render() {
        let that=this;
        return( <>
                    {this.renderToolbar()}
                    <div className="appSummary">

                        <div className="category">
                            Which domain would you like to claim?
                        </div>

                        {this.renderRow({
                            id: "reserve_name", 
                            type: "text", 
                            label: "Domain", 
                            hint: "Enter the domain name of your web app.", 
                            placeholder: "mydomain.com",
                            isCompulsory: true,
                            fnValidate: function (_input) {
                                return that.validateDomain(_input);
                            },
                            fnEnableForm: function (_input) {
                                return that.enableReserveForm(_input);
                            }
                        })}

                        <div 
                            className={"btn btn-tiny btn-primary " + (this.state.canValidate? "" : "disabled")}
                            onClick = {this.async_reserveDomain.bind(this)}
                        >
                            Configure this domain!
                        </div>
                    </div>

        </>
        )
    }
}

export default AdminFormReserve;
