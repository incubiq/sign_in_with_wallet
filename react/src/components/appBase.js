import React, {Component} from "react";
import ViewFooter from "./viewFooter";
import {CRITICALITY_LOW, CRITICALITY_NORMAL, CRITICALITY_SEVERE} from "../const/message";

import {getMyIdentities} from "../services/me";



class AppBase extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);

        let aId=getMyIdentities();
        this.state={

            // User identities
            aIdentity: aId,                           // all user's known identities (from cache)
            iSelectedIdentity: null,                  // if not null, user is authenticated 
            
            // theme
            theme: this.props.theme,                  // todo : likely remove from here (set the theme before calling in here)

            // UI/UX
            hover: null,                              // to display any msg to user in footer
            inTimerEffect: false,
            delayEffect: 4000,
            incEffect: 50,
            criticality: CRITICALITY_LOW
        } 
    }

    componentDidMount() {
    }
    
    componentDidUpdate(prevProps) {
    }

    getShortenAnonAddress(_address) {
        if(!_address)
            return "";
        return _address.substr(0,4)+"..."+_address.substr(_address.length-6,6)
    }

    getmyuri(n,s) {
        n = n.replace(/[[]/,"\\[").replace(/[\]]/,"\\]");
        var p = (new RegExp("[\\?&]"+n+"=([^&#]*)")).exec(s);
        return (p===null) ? "" : p[1];
    }
    
    callbackEffect( ){

    }

    showMessage(objMsg){
        if(!objMsg || !objMsg.message) {
            return;
        }

        this.setState({hover: objMsg.message});
        if(!objMsg.criticality) {
            objMsg.criticality=CRITICALITY_LOW;
        }
        this.setState({criticality: objMsg.criticality});
    }

/*
 *        UI / UX
 */

    renderFooter() {
        return (
            <ViewFooter 
                version={this.props.version}
                theme = {this.state.theme}
                message = {this.state.hover}
                inTimerEffect = {this.state.inTimerEffect}
                delayEffect = {this.state.delayEffect}
                incEffect = {this.state.incEffect}
                callback = {this.callbackEffect.bind(this)}
                criticality = {this.state.criticality}
            />
        );
    }

    render() {
        return( 
            <> 
                Welcome SIWW
            </>
        );
    }
}

export default AppBase;
