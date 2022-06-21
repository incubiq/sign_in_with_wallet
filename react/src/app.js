import React, {Component} from "react";
import {NavLink} from 'react-router-dom';
import "./app.css";

class App extends Component {

  render( ){
    return (
        <div>
            
            <div></div>

            <NavLink 
                to="/doc"  
            >
                <button id='btnAccessDoc'>Access Documentation...</button>
            </NavLink>

            <br />
            <br />

            <NavLink 
                to="/connect"  
            >
                <button id='btnConnectWallet'>Connect Wallet...</button>
            </NavLink>

            <br />
            <br />

            <NavLink 
                to="/authenticate"  
            >
                <button id='btnSignMessage'>Sign Message...</button>
            </NavLink>

        </div>
    )
  }
}

export default App;
