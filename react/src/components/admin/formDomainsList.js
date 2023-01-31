import {Component} from "react";
import ViewDomain from "../viewDomain";

class FormDomainsList extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    
        this.state={
            isPreview: false,
            isDialogOwnershipVisible: false,

        }
    }

/*
 *          Preview dialog 
 */

    onClaimDomain() {
        this.props.onChangeAppId(null, -1);
    }

    onConfigureLocalhost() {
        this.props.onChangeAppId("localhost", -1);
    }

    onSelectDomain(client_id, _index) {
        this.props.onChangeAppId(client_id, _index);
    }

    render() {
        return(
            <>
                    <ul className="panel-list"> 
                        <li className={"domain-selector" + (this.props.app_id===null && this.props.iSelDomain===null ? " selected" : "")} >
                            <ViewDomain 
                                logo = "/assets/images/icon_plus.png"
                                domain_name = "<yourdomain.com>"
                                display_name = "Claim a domain!"
                                isVerified= {null}
                                onClick = {this.onClaimDomain.bind(this)}
                            />
                        </li>

                        <li className={"domain-selector" + (this.props.app_id==="localhost"? " selected": "")} >
                            <ViewDomain 
                                logo = "/assets/images/icon_test.png"
                                domain_name = "<localhost>"
                                display_name = "Config local test"
                                isVerified= {null}
                                onClick = {this.onConfigureLocalhost.bind(this)}
                            />
                        </li>

                        {this.props.aClaimedDomain.map((item, index) => (
                            <li 
                                className= {"domain-selector" + (this.props.aClaimedDomain.length>0 && this.props.app_id!=="localhost" && index===this.props.iSelDomain? " selected" : "")}
                                key = {index}
                            >

                                <ViewDomain 
                                    logo = {item.theme.logo}
                                    domain_name = {item.domain_name}
                                    display_name = {item.display_name}
                                    isVerified= {item.is_verified}
                                    app_id = {item.app_id}
                                    index = {index}
                                    onClick = {(evt) => {
                                        let idElt=evt.currentTarget;
                                        let _id=idElt.getAttribute("attr-id");
                                        let _idx=idElt.getAttribute("attr-index");
                                        this.onSelectDomain(_id, parseInt(_idx));
                                    }}
                                />
                            </li>
                        ))}

                    </ul>

            </>);
    }
}

export default FormDomainsList;
