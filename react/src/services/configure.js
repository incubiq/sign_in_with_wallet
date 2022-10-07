
import Cookies from 'js-cookie';
import {API_HOST, API_WEB3ROUTE, API_PRIVATEROUTE, srv_getRoute, srv_postRoute} from "./base";

const srv_getDomainInfo = async (client_id) => {
  return await srv_getRoute(API_HOST+API_WEB3ROUTE+"domain/"+client_id);
}

const srv_privatePing = async (objParam) => {
  if(objParam && objParam.cookie) {
    Cookies.set(
      objParam.cookie.name, 
      objParam.cookie.token, { 
        expires: (objParam.cookie.duration? objParam.cookie.duration : 3),          // 3 days
        path: (objParam.cookie.path? objParam.cookie.path: "/")
      }
    );
    delete(objParam.cookie)
  }
  return await srv_postRoute(API_HOST+API_PRIVATEROUTE+"ping/", objParam);
}

// call this to reserve this domain before final claim (claim need to happen within 5min of reserve)
const srv_reserveDomain = async(obj) => {
  return await srv_postRoute(API_HOST+API_WEB3ROUTE+'domain/reserve', obj);
}

// call this to claim this domain (full oAuth config validation)
const srv_claimDomain = async(obj) => {
  return await srv_postRoute(API_HOST+API_WEB3ROUTE+'domain/claim', obj);
}

export { 
  srv_privatePing,
  srv_reserveDomain,
  srv_claimDomain,
  srv_getDomainInfo
}