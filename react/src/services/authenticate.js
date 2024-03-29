
import {API_HOST, API_WEB3ROUTE, API_OAUTHROUTE, API_PUBLICROUTE, srv_postRoute, srv_getRoute, API_PRIVATEROUTE} from "./base";

// call this to request an Authentication cookie to SIWW
const srv_getMe = async(obj, _token) => {
  return await srv_getRoute(API_HOST+API_PRIVATEROUTE+'me?connector='+obj.connector+"&wallet_id="+obj.wallet_id+"&wallet_address="+obj.wallet_address, _token);
}

// call this to request an Authentication cookie to SIWW
const srv_prepare = async(obj) => {
  return await srv_postRoute(API_HOST+API_WEB3ROUTE+'prepare', {
    connector: obj.connector,
    blockchain_symbol: obj.blockchain_symbol,
    wallet_id: obj.wallet_id,
    wallet_address: obj.wallet_address,
    app_id: obj.app_id
  });
}

// call this to authenticate into SIWW
const srv_authenticate = async(obj) => {
  try {
    let jsonStr=JSON.stringify({
      username: obj.username
    });

    const response = await fetch(API_HOST+API_OAUTHROUTE+'login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: jsonStr,
    });

    if(response.redirected) {
      if(response.status===404) {
        window.location.replace("/");
      }
      else {
        window.location.replace(response.url);
      }
    }
    return;
  } catch(error) {
    console.log(error);
    return {data: null};
  }
}

// call this to request an Authentication cookie to SIWW
const srv_verify = async(obj) => {
  return await srv_postRoute(API_HOST+API_WEB3ROUTE+'verify', {
    connector: obj.connector,
    buffer: obj.buffer,
    key: obj.key,
    signature: obj.signature,
    type: obj.type,
    address: obj.address,
    issued_at: obj.issued_at,
    valid_for: obj.valid_for,
  });
}

// call this to check user authorizations in the background
const srv_getAuthorizedLevels = async(obj) => {
  return await srv_getRoute(API_HOST+API_PUBLICROUTE+'authorization?app_id='+obj.app_id+"&connector="+obj.connector+"&address="+obj.address);
}

export { 
  srv_getMe,
  srv_prepare,
  srv_authenticate,
  srv_verify,
  srv_getAuthorizedLevels
}