
import {API_HOST, API_PRIVATEROUTE, API_PUBLICROUTE, srv_getRoute, srv_getUniqueRoute} from "./base";
const API_OAUTHROUTE= "/oauth/";
const API_WEB3ROUTE= "/web3/";

const srv_prepare = async(obj) => {
  try {
    let jsonStr=JSON.stringify({
      provider: "SIWC",
      wallet_id: obj.wallet_id,
      wallet_addr: obj.wallet_addr,
      socket_id: obj.socket_id,
      client_id: obj.client_id
    });

    const response = await fetch(API_HOST+API_WEB3ROUTE+'prepare', {
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

export { 
  srv_prepare,
  srv_authenticate
}