
const API_HOST= "http://localhost:3010";
const API_PUBLICROUTE= "/api/v1/public/";
const API_PRIVATEROUTE= "/api/v1/private/";
const API_WEB3ROUTE= "/web3/";
const API_OAUTHROUTE= "/oauth/";


const srv_getRoute = async(route) => {
  try {
    const response = await fetch(route, {
        method: 'GET'
      }
    );
    const json = await response.json();
    return json;
  } catch(error) {
    console.log("Error GET "+ error? error : "");
    return {data: null};
  }
}

const srv_getUniqueRoute = async(route) => {
  try {
    let ts=new Date().getTime();
    let _route=route+"?ts="+ts
    return srv_getRoute(_route);
  } catch(error) {
    console.log("Error GET Unique "+ error? error : "");
    return {data: null};
  }
}

const srv_patchRoute = async (route, data) => {
  return _srv_pRoute('PATCH', route, data);
}

const srv_postRoute = async (route, data) => {
  return _srv_pRoute('POST', route, data);
}

const _srv_pRoute = async (verb, route, data) => {
  try {
    let jsonStr=data? JSON.stringify(data): null;
    let _query={
      method: verb,
      headers: {'Content-Type': 'application/json'},
    }
    if(jsonStr) {
      _query.body=jsonStr;
    }

    const response = await fetch(route, _query);
    const json = await response.json();
    return json;
  } catch(error) {
    console.log(error);
    return {data: null};
  }
}


const srv_deleteRoute = async (route) => {
  try {
    const response = await fetch(route, {
        method: 'DELETE'
      }
    );
    if(response.status!==204) {
      return response;
    }
    return {data: null};
  } catch(error) {
    console.log(error);
    return {data: null};
  }
}

// ping server, get version
const srv_getSIWW = async() => {
  return srv_getRoute(API_HOST+API_PUBLICROUTE);
}

export { 
  API_HOST,
  API_PRIVATEROUTE,
  API_PUBLICROUTE,
  API_WEB3ROUTE,
  API_OAUTHROUTE,
  srv_getRoute, 
  srv_getUniqueRoute,
  srv_patchRoute,
  srv_postRoute,
  srv_deleteRoute,
  srv_getSIWW, 
}