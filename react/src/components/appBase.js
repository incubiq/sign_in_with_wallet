import React, {Component} from "react";
import ViewFooter from "./viewFooter";

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

    callbackEffect( ){

    }

    showMessage(_msg){
        this.setState({hover: _msg});
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
