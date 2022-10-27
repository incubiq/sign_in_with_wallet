/*
 *      Sign-In With Wallet - Multi wallet Entry point
 */

import {siwc_connect} from "./siwc_connect"

export class siww {
    
    getConnector(_chain) {
        if(!_chain) {return null}
        _chain=_chain.toLowerCase();

        // get the chain or wallet connector
        switch(_chain) {
            case "cardano":
                return new siwc_connect();

            default: 
                return null;
        }
    }

}

export default siww;