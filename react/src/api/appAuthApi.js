import AppAuth from "../components/authAuthenticate";
import {srv_getSIWW} from "../services/base";

class AppAuthApi extends AppAuth {

/*
 *          page inits
 */

    constructor(props) {
        super(props);    

        this.async_onGetInfo()
            .then(function(dataInfo){
                return;
            })
    }

/*
 *          APIs
 */
    async async_onGetInfo() {
        return await srv_getSIWW();
    }
    

    render() {
        return (
            <div>
            </div>
        )
    }
}

export default AppAuthApi;
