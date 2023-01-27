import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Cookies from 'js-cookie';

import AppRoutes from "./appRoutes";
import {srv_getSIWW} from "./services/base";
import {setCacheEncryption} from "./services/cache";
import {srv_getDomainInfo} from "./services/configure";
import {registerWebAppWithIdentity, getMyIdentities} from "./services/me";

import "./assets/css/app.css";
import "./assets/css/siww.css";

let gDidMount=false;

export default function AppRouter(props) {

  // Our backend basic info
  const [version, setVersion] = useState(""); 
  const [isDebug, setIsDebug] = useState(false); 
  const [host, setHost] = useState(""); 

  // Admin Authentication cookie (access to admin panel)
  const [adminCookieName, setAdminCookieName] = useState(null); 
  const [adminCookieToken, setAdminCookieToken] = useState(null); 
  const [adminCookieSecret, setAdminCookieSecret] = useState(null);

  // User Authentication cookie (access to apps via oAuth)
  const [cookieName, setCookieName] = useState(null); 
  const [cookieToken, setCookieToken] = useState(null); 
  const [cookieSecret, setCookieSecret] = useState(null);

  // Localstore encrypt secret
  const [cacheSecret, setCacheSecret] = useState(null);

  // Target WebApp info
  const [webAppId, setWebAppId] = useState(null); 
  const [webAppName, setWebAppName] = useState(null); 
  const [webAppDomain, setWebAppDomain] = useState(null); 
  const [webApp, setWebApp] = useState(null); 
  const [theme, setTheme] = useState(null); 
  const [styles, setStyles] = useState(null); 
  
  const navigate = useNavigate();

  useEffect(() => {
    if(!gDidMount) {

      gDidMount=true;

      // default theme anyway...
      initializeTheme(null);
      
      // get SIWW version
      srv_getSIWW()
        .then(dataInfo => {
          if(dataInfo && dataInfo.data) {
            setVersion(dataInfo.data.version);
            setIsDebug(dataInfo.data.isDebug);
            setHost(dataInfo.data.host);

            //TODO ... need to pass the key from server in a more secure way than this
            setCacheSecret(dataInfo.data.cache_secret);
            setCacheEncryption(dataInfo.data.cache_secret);
            setAdminCookieSecret(dataInfo.data.jwt_secret);
            setCookieSecret(dataInfo.data.jwt_secret);

            // do we have a cookie?? if yes, we may already be authenticated
            let _name=dataInfo.data.isDebug? 'jwt_DEBUG_token_SIWW' : 'jwt_token_SIWW';
            setCookieName(_name);            
            let _token=Cookies.get(_name);  
            if(_token && _token!==cookieToken) {
              setCookieToken(_token);
            }
          
            // admin cookie
            _name=dataInfo.data.isDebug? 'jwt_DEBUG_token_ADMIN_SIWW' : 'jwt_token_ADMIN_SIWW';
            setAdminCookieName(_name);            
            _token=Cookies.get(_name);  
            if(_token && _token!==cookieToken) {
              setAdminCookieToken(_token);
            }
            
            // do we have a requesting webapp? if yes, we prepare all for it
            let _client_id=decodeURIComponent(decodeURIComponent(getmyuri("app_id", window.location.search)));
            if(_client_id!=="") {
              async_initializeDomain(_client_id);
            }
          }
        })
    }
  });

  const getmyuri = (n,s) => {
    n = n.replace(/[[]/,"\\[").replace(/[\]]/,"\\]");
    var p = (new RegExp("[\\?&]"+n+"=([^&#]*)")).exec(s);
    return (p===null) ? "" : p[1];
  }
  
  const initializeTheme = (baseTheme)=> {
      // default theme and styles
      let _theme={
        webapp: {
        dark_mode: false,
        background:  "/assets/images/siww_background.jpg",
        logo: "/assets/images/logo_www.png",
        color: {
            text: "#333",
            button: "#003366",
            button_text: "#f0f0f0"
        }
      }};

      if(baseTheme && baseTheme.background) {_theme.webapp.background=baseTheme.background}
      if(baseTheme && baseTheme.logo) {_theme.webapp.logo=baseTheme.logo}
      if(baseTheme && baseTheme.color) {_theme.webapp.color=baseTheme.color}
      if(baseTheme && baseTheme.dark_mode===true) {_theme.webapp.dark_mode=true}

      let _styles= {
        container: {
          backgroundImage: (_theme && _theme.webapp && _theme.webapp.background? "url("+_theme.webapp.background+")" : null),
          color: (_theme && _theme.webapp && _theme.webapp.color.text ? _theme.webapp.color.text : null)
        },
      }

      setStyles(_styles);
      setTheme(_theme);
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

          // specific theme update
          initializeTheme(dataDomain.data.theme);
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

  const onUpdateCookie = (_cookie) => {
    setCookieName(_cookie.name);
    setCookieToken(_cookie.token);

    Cookies.set(_cookie.name, _cookie.token, {
      expires: "72h", 
      path: '' 
    });
  }

  const onRedirect = async (_route) => {
    let _client_id=decodeURIComponent(decodeURIComponent(getmyuri("app_id", _route)));
    await async_initializeDomain(_client_id);
    navigate(_route);
  }

  return (
      <>     
        <AppRoutes 

          // utils
          version = {version}
          isDebug = {isDebug}
          host = {host}
          onSoftRedirect = {onRedirect}

          // cookie
          AdminCookieName = {adminCookieName}
          AdminCookieToken = {adminCookieToken}
          AdminCookieSecret = {adminCookieSecret}
          AuthenticationCookieName = {cookieName}
          AuthenticationCookieToken = {cookieToken}
          AuthenticationCookieSecret = {cookieSecret}
          onUpdateCookie = {onUpdateCookie}

          // cache
          CacheSecret = {cacheSecret}

          // webapp
          webAppId = {webAppId}
          webAppName = {webAppName}
          webAppDomain = {webAppDomain}
          webApp = {webApp}
          theme={theme}
          styles={styles}

        />
      </>
  );
}
