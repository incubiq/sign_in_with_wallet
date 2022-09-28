import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppRoutes from "./appRoutes";
import io from 'socket.io-client';

import "./assets/css/app.css";
import "./assets/css/siww.css";

let gDidSocketConnect=false;
let gDidMount=false;
const socket = io("/client");       

export default function AppRouter(props) {
  const [didSocketConnect, setDidSocketConnect] = useState(gDidSocketConnect); 
  const navigate = useNavigate();

  useEffect(() => {
    if(!gDidMount) {
      gDidMount=true;
      socket.on("connect", _args => { 
        if(gDidMount && !gDidSocketConnect) {
          if(socket && socket.connected) {
            setDidSocketConnect(true);
            gDidSocketConnect=true;  
          }
        }
      });            
    }
  }, []);

  const onRedirect = (_route) => {
    navigate(_route);
  }

  const getSocket = ( ) => {
    return socket;
  }

  return (
      <>     
        <AppRoutes 
          onSoftRedirect = {onRedirect}
          didSocketConnect = {didSocketConnect}
          getSocket = {getSocket}
        />
      </>
  );
}
