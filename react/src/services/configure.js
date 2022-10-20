import {API_HOST, API_WEB3ROUTE, API_PRIVATEROUTE, srv_getRoute, srv_postRoute} from "./base";

/* 
 *      Public calls
 */

const srv_getDomainInfo = async (client_id) => {
  return await srv_getRoute(API_HOST+API_WEB3ROUTE+"domain/"+client_id);
}

/* 
 *      Private calls (as authenticated Admin)
 */

// call this to reserve this domain before final claim (claim need to happen within 5min of reserve)
const srv_reserveDomain = async(obj, _token) => {
  return await srv_postRoute(API_HOST+API_PRIVATEROUTE+'domain/reserve', obj, _token);
}

// call this to claim this domain (full oAuth config validation)
const srv_claimDomain = async(obj, _token) => {
  return await srv_postRoute(API_HOST+API_PRIVATEROUTE+'domain/claim', obj, _token);
}

const srv_getDomainPrivateInfo = async (client_id, _token) => {
  return await srv_getRoute(API_HOST+API_PRIVATEROUTE+"domain/"+client_id,  _token);
}

const srv_getDomains = async (obj, _token) => {
  return await srv_getRoute(API_HOST+API_PRIVATEROUTE+"domains/",  _token);
}

export { 
  srv_reserveDomain,
  srv_claimDomain,
  srv_getDomainInfo,
  srv_getDomainPrivateInfo,
  srv_getDomains
}