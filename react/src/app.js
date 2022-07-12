import React, {Component} from "react";
import {NavLink} from 'react-router-dom';
import "./app.css";

class App extends Component {

  render( ){
    return (
        <div>
            
            <div></div>

            <NavLink 
                to="/"  
            >
            <button 
                id='btnAccessDoc'
                onClick={() => {
                        window.open("https://eric-duneau.gitbook.io/siwc/", "_blank");
                    }
                }
            >Access Documentation...</button>
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
