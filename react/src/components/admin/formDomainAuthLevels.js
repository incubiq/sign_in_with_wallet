import {Component} from "react";
import {getSupportedConnectors, getConnectorDisplayName} from "../../assets/themes/all"; 
import {getAuthorizationCondition, getAuthorizationConditions, getAuthorizationOperator, getAuthorizationOperators} from "../../const/authorization"; 

class AdminFormDomainLevels extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    
        this.state = {
            // authorization levels
            aConnectors: getSupportedConnectors().aConnector,
            curConditionName: "",
            curConditionConnector: "SIWC",
            curConditionProperty: "",
            curConditionOperator: "",
            curConditionValue: "",

            aLevel: [{
                name: "default",
                condition: {
                    property: null,
                    operator: null,
                    value: null
                },
                connector: null                            // SIWC (Cardano), others...
            }]
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps.aLevel !== this.props.aLevel)  {
            this.setState({aLevel: this.props.aLevel});
        }
    }     

/*
 *          Levels UI
 */

    toggleAddAuthorization(event) {
        let eltDlg=document.getElementById("configuration_addAuthorization");
        eltDlg.className=this.state.isAddAuthorization? "hidden": "addAuthorization"

        // closing the dialog?
        if(this.state.isAddAuthorization) {
            this.setState({curConditionConnector : ""});        // need this to refresh select of all props
        }
        else {
            // default condition at start of dialog
            this.setState({curConditionName : ""})
            this.setState({curConditionConnector : "SIWC"})
            let defaultCondition=getAuthorizationConditions("SIWC")[0];
            this.setState({curConditionProperty : defaultCondition.property})
            this.setState({curConditionOperator : defaultCondition.default})
            this.setState({curConditionValue : ""})
        }


        // show / hide dialog
        this.setState({isAddAuthorization: !this.state.isAddAuthorization});
    }

    addAuthorization() {
        // Add this authorization condition?
        if(this.canAddAuthorization({
            name: this.state.curConditionName,
            value: this.state.curConditionValue
        })) {
            let aCond=this.state.aLevel;
            aCond.push({
                name: this.state.curConditionName,
                connector: this.state.curConditionConnector,
                condition: {
                    property: this.state.curConditionProperty,
                    operator: this.state.curConditionOperator,
                    value: this.state.curConditionValue
                }
            });
            this.setState({aLevel: aCond});

        }
        this.toggleAddAuthorization();
    }

    removeAuthorization (_event) {
        let _name=_event.currentTarget.dataset? _event.currentTarget.dataset.name : null;
        let aCond=[];
        this.state.aLevel.forEach(item => {
            if(item.name!==_name) {
                aCond.push(item);
            }
        });
        this.setState({aLevel: aCond});
    }

    canAddAuthorization(objParam) {

        // make sure we have a name 
        if((objParam.name===null || objParam.name==="")) {
            return false
        }

        // make sure name is not a duplicate
        let bFound=false;
        this.state.aLevel.forEach(item => {
            if(item.name===objParam.name) {bFound=true}
        });
        if(bFound) {
            return false;
        }

        // make sure we have a condition value
        if((objParam.value===null || objParam.value==="")) {
            return false;
        }

        return true;
    }

    _validateAuthorization(objParam) {
        let eltBtn=document.getElementById("btnAddAuthorization");
        if(this.canAddAuthorization(objParam)) {
            eltBtn.classList.remove("disabled");
        }
        else {
            eltBtn.classList.add("disabled");
        }
    }

    renderAuthorizationDialog() {
        return (<div 
            id="configuration_addAuthorization"
            className="hidden"
        >
            <div className="modalContainer blur"></div>
            <div className={"modal center-vh" + (this.props.theme && this.props.theme.webapp.dark_mode ? "dark-mode": "")} style={this.props.styles.color}>
                <div className="siww-header">
                    <span>Add an Authorization level</span>
                </div>

                <div className="">
                    <ul className="row-list">            
                        <li className="row">
                            <span className="label">Name</span>
                            <input 
                                type="text" 
                                className="value"
                                value = {this.state.curConditionName}
                                id="configuration_addAuthorization_name" 
                                placeholder = "Enter a meaningful name"
                                onChange={(_event) => {
                                    this.setState({curConditionName : _event.target.value});
                                    this._validateAuthorization({
                                        name: _event.target.value,
                                        value: this.state.curConditionValue
                                    });
                                }}
                            />
                            <div className="hint align-left">
                                If the condition triggers, your app receives this level name with the shared data 
                            </div>
                        </li>

                        <li className="row">
                            <span className="label">Connector</span>
                            <select 
                                id="configuration_addAuthorization_connector" 
                                onChange={(_event) => {
                                    this.setState({curConditionConnector : _event.target.value});
                                    this._validateAuthorization({
                                        name: this.state.curConditionName,
                                        value: this.state.curConditionValue
                                    });
                                }}
                            >
                                {this.state.aConnectors.map((item, index) => (
                                    <option value={item} key={index}>{getConnectorDisplayName(item)}</option>
                                ))}

                            </select>
                            <div className="hint align-left">
                                This authorization level only triggers with this connector
                            </div>
                        </li>

                        <li className="row">
                            <select 
                                    id="configuration_addAuthorization_conditionProperty" 
                                    defaultValue={this.state.curConditionProperty}
                                    onChange={(_event) => {
                                        this.setState({curConditionProperty : _event.target.value});
                                        this.setState({curConditionOperator : getAuthorizationCondition(_event.target.value).default});
                                    }}
                                >
                                    {getAuthorizationConditions(this.state.curConditionConnector).map((item, index) => (
                                        <option 
                                            value={item.property} 
                                            key={index}                                               
                                        >{item.display}</option> 
                                    ))}
                            </select>
                            &nbsp;
                            <select 
                                id="configuration_addAuthorization_conditionOperator" 
                                defaultValue={this.state.curConditionOperator}                              
                                onChange={(_event) => {
                                    this.setState({curConditionOperator : _event.target.value});
                                    this._validateAuthorization({
                                        name: this.state.curConditionName,
                                        value: this.state.curConditionValue
                                    });
                                }}
                            >
                                {getAuthorizationOperators(this.state.curConditionProperty).map((item, index) => (
                                    <option 
                                        value={item.value} 
                                        key={index}                                         
                                    >{item.display}</option> 
                                ))}
                            </select>
                            &nbsp;
                            <input 
                                type={getAuthorizationOperator(this.state.curConditionOperator).type}
                                className="value"
                                value = {this.state.curConditionValue}
                                id="configuration_addAuthorization_conditionValue" 
                                placeholder = "Value to trigger condition"
                                onChange={(_event) => {
                                    this.setState({curConditionValue : _event.target.value});
                                    this._validateAuthorization({
                                        name: this.state.curConditionName,
                                        value: _event.target.value
                                    });
                                }}
                            />
                            <div className="hint align-left">
                                The condition the user's wallet must meet for trigerring this authorization level
                            </div>                            
                        </li>
                    </ul>

                </div>

                <div className="siww-footer">
                    <div className="identity_action">
                        <div className="btn btn-tiny actionLink back"
                            onClick = {this.toggleAddAuthorization.bind(this)}
                        >
                            Cancel
                        </div>                            

                        <div className="btn btn-tiny disabled" id="btnAddAuthorization"
                            onClick = {this.addAuthorization.bind(this)}
                        >
                            Add Level
                        </div>
                    </div>
                </div>
            </div>
        </div>
        );
    }

    render() {
        return(
            <>
                <ul className="row-list">
                    {this.state.aLevel.map((item, index) => (
                        <li className="row compulsory"
                            key={index}
                        >

                            <div className="group">
                                <span className="row-name">Name</span>
                                <span className="row-property">{item.name}</span>
                            </div>
                            <div className="group">
                                <span className="row-name">Condition</span>
                                <span className="row-property">{item.condition.property? getAuthorizationCondition(item.condition.property).display + " "+getAuthorizationOperator(item.condition.operator).display+ " " +item.condition.value : "none"}</span>
                            </div>
                            {item.connector? 
                            <>
                                <div className="group">
                                    <span className="row-name">Connector</span>
                                    <span className="row-property">{getConnectorDisplayName(item.connector)}</span>
                                </div>

                                <div className="row compulsory align-left">
                                <div className="btn btn-tiny"
                                    data-name={item.name}
                                    onClick = {this.removeAuthorization.bind(this)}
                                >
                                    <img className="icon" src="/assets/images/icon_delete.png" alt="Delete"/>
                                    <span>Remove this authorization level!</span>
                                </div>
                                </div>
                            </>
                            :""}

                        </li>
                    ))}
                </ul>

                <div className="row compulsory align-left">
                    <div className={this.props.is_verified===true? "btn btn-tiny" : "btn btn-tiny disabled"}
                        onClick = {this.toggleAddAuthorization.bind(this)}
                    >
                        <img className="icon" src="/assets/images/icon_plus.png" alt="Add" />
                        <span>Add an authorization level...</span>
                    </div>
                    {this.props.is_verified===false ?
                        <div className="hint align-left">
                            <img className="icon" src="/assets/images/icon_warning.png" alt="Warning" />
                            <span>Verify your domain to enable authorization levels</span>
                        </div>
                    :""}

                    {this.renderAuthorizationDialog()}

                </div>
                            
            </>
        )        
    }   
}

export default AdminFormDomainLevels;
