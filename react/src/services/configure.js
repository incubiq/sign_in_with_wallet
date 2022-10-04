
import {API_HOST, srv_getRoute} from "./base";
const API_WEB3ROUTE= "/web3/";

const srv_getDomainInfo = async (client_id) => {
  return await srv_getRoute(API_HOST+API_WEB3ROUTE+"domain/"+client_id);
}

// call this to reserve this domain before final claim (claim need to happen within 5min of reserve)
const srv_reserveDomain = async(obj) => {
  try {
    let jsonStr=JSON.stringify(obj);

    const response = await fetch(API_HOST+API_WEB3ROUTE+'domain/reserve', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: jsonStr,
    });

    return response;

  } catch(error) {
    console.log(error);
    return {data: null};
  }
}

// call this to claim this domain (full oAuth config validation)
const srv_claimDomain = async(obj) => {
  try {
    let jsonStr=JSON.stringify(obj);

    const response = await fetch(API_HOST+API_WEB3ROUTE+'domain/claim', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: jsonStr,
    });

    return response;

  } catch(error) {
    console.log(error);
    return {data: null};
  }
}

export { 
  srv_reserveDomain,
  srv_claimDomain,
  srv_getDomainInfo
}