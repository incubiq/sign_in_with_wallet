
import {API_HOST, API_ADMINROUTE, srv_getRoute} from "./base";

// will call the backend login route (/admin) then goes to where it needs for oAuth
const srv_login = async() => {
  return await srv_getRoute(API_HOST+API_ADMINROUTE);
}

// will remove the admin cookie
const srv_logout = async() => {
  return await srv_getRoute(API_HOST+API_ADMINROUTE+'logout');
}


export { 
  srv_login,
  srv_logout
}