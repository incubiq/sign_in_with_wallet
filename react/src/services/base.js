
const API_HOST= window.location.hostname==="localhost"? "http://localhost:3010": "";
const API_PUBLICROUTE= "/api/v1/public/";
const API_PRIVATEROUTE= "/api/v1/private/";
const API_WEB3ROUTE= "/web3/";
const API_OAUTHROUTE= "/oauth/";


const srv_getRoute = async(route, _token) => {
  try {
    let isPrivate=route.includes(API_PRIVATEROUTE);
    let _query={
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    }
    if(isPrivate && _token) {
      _query.headers["Authorization"]="Bearer " + (_token? _token : "")
    }
    const response = await fetch(route, _query);
    const json = await response.json();
    return json;
  } catch(error) {
    console.log("Error GET "+ error? error : "");
    return {data: null};
  }
}

const srv_getUniqueRoute = async(route, _token) => {
  try {
    let ts=new Date().getTime();
    let _route=route+"?ts="+ts
    return srv_getRoute(_route, _token);
  } catch(error) {
    console.log("Error GET Unique "+ error? error : "");
    return {data: null};
  }
}

const srv_patchRoute = async (route, data, _token) => {
  return _srv_pRoute('PATCH', route, data, _token);
}

const srv_postRoute = async (route, data, _token) => {
  return _srv_pRoute('POST', route, data, _token);
}

const _srv_pRoute = async (verb, route, data, _token) => {
  try {
    let isPrivate=route.includes(API_PRIVATEROUTE);
    let jsonStr=data? JSON.stringify(data): null;
    let _query={
      method: verb,
      headers: {'Content-Type': 'application/json'},
    }
    if(isPrivate && _token) {
      _query.headers["Authorization"]="Bearer " + (_token? _token : "")
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