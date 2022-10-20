import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Cookies from 'js-cookie';
import io from 'socket.io-client';

import AppRoutes from "./appRoutes";
import {srv_getSIWW} from "./services/base";
import {setCacheEncryption} from "./services/cache";
import {srv_getDomainInfo} from "./services/configure";
import {registerWebAppWithIdentity, getMyIdentities} from "./services/me";

import "./assets/css/app.css";
import "./assets/css/siww.css";

let gDidSocketConnect=false;
let gDidMount=false;
const socket = io("/client");       

export default function AppRouter(props) {
  const [didSocketConnect, setDidSocketConnect] = useState(false); 

  // Our backend basic info
  const [version, setVersion] = useState(""); 
  const [isDebug, setIsDebug] = useState(false); 
  const [host, setHost] = useState(""); 

  // Authentication cookie
  const [cookieName, setCookieName] = useState(null); 
  const [cookieToken, setCookieToken] = useState(null); 
  const [cookieSecret, setCookieSecret] = useState("somekey_1234567890");     // secret to decode cookie - TODO ... need to pass the key from server (DO NOT KEEP this into prod)

  // Localstore encrypt secret
  const [cacheSecret, setCacheSecret] = useState("cacheEncryptionKey_1234567890");     // secret to encode localstore - TODO ... need to pass the key from server (DO NOT KEEP this into prod)

  // Target WebApp info
  const [webAppId, setWebAppId] = useState(null); 
  const [webAppName, setWebAppName] = useState(null); 
  const [webAppDomain, setWebAppDomain] = useState(null); 
  const [webApp, setWebApp] = useState(null); 

  const navigate = useNavigate();

  // some basic inits
  setCacheEncryption(cacheSecret);

  useEffect(() => {
    if(!gDidMount) {

      gDidMount=true;
      
      // get SIWW version
      srv_getSIWW()
        .then(dataInfo => {
          if(dataInfo && dataInfo.data) {
            setVersion(dataInfo.data.version);
            setIsDebug(dataInfo.data.isDebug);
            setHost(dataInfo.data.host);

            // do we have a cookie?? if yes, we may already be authenticated
            let _name=dataInfo.data.isDebug? 'jwt_DEBUG_token_SIWW' : 'jwt_token_SIWW';
            setCookieName(_name);
            let _token=Cookies.get(_name);  
            if(_token) {
              setCookieToken(_token);
            }
          
            // do we have a requesting webapp? if yes, we prepare all for it
            let _client_id=decodeURIComponent(decodeURIComponent(getmyuri("app_id", window.location.search)));
            async_initializeDomain(_client_id);

            // open sockets
            socket.on("connect", _args => { 
              if(gDidMount && !gDidSocketConnect) {
                if(socket && socket.connected) {
                  setDidSocketConnect(true);
                  gDidSocketConnect=true;  
                  
                  // Receive the authentication cookie
                  socket.on('auth_cookie', _cookie => {
                    setCookieToken(_cookie.token);
                  })       
                }
              }
            });              
          }
        })
    }
  }, []);

  const getmyuri = (n,s) => {
    n = n.replace(/[[]/,"\\[").replace(/[\]]/,"\\]");
    var p = (new RegExp("[\\?&]"+n+"=([^&#]*)")).exec(s);
    return (p===null) ? "" : p[1];
  }
  
  // get all necessary info from connecting webapp
  const async_initializeDomain = async (_client_id) => {
    if (_client_id && _client_id!=="") {
      let dataDomain=await srv_getDomainInfo(_client_id);
      if(dataDomain && dataDomain.data) {
          setWebAppId(_client_id);
          setWebAppName(dataDomain.data.display_name);
          setWebAppDomain(dataDomain.data.domain_name);
          setWebApp(dataDomain.data);
      }

      // get the scope...
      if(dataDomain && dataDomain.data && dataDomain.data.aScope) {
          let aId=getMyIdentities();
      
          // make sure WebApp is registered (not necessarily granted yet, but registered) for each known identity of this user...
          aId.forEach(item=> {
              registerWebAppWithIdentity(item.username, {
                  app_id: _client_id,
                  aScope: dataDomain.data.aScope
              });    
          });
      }
    }
    else {
      setWebAppId(null);
      setWebAppName(null);
      setWebAppDomain(null);
      setWebApp(null);
    }
  }

  const onRedirect = async (_route) => {
    let _client_id=decodeURIComponent(decodeURIComponent(getmyuri("app_id", _route)));
    await async_initializeDomain(_client_id);
    navigate(_route);
  }

  const getSocket = ( ) => {
    return socket;
  }

  return (
      <>     
        <AppRoutes 
          // socket
          didSocketConnect = {didSocketConnect}
          getSocket = {getSocket}

          // utils
          version = {version}
          isDebug = {isDebug}
          host = {host}
          onSoftRedirect = {onRedirect}

          // cookie
          AuthenticationCookieName = {cookieName}
          AuthenticationCookieToken = {cookieToken}
          AuthenticationCookieSecret = {cookieSecret}

          // cache
          CacheSecret = {cacheSecret}

          // webapp
          webAppId = {webAppId}
          webAppName = {webAppName}
          webAppDomain = {webAppDomain}
          webApp = {webApp}
          
        />
      </>
  );
}
