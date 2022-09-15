import React, {Component} from "react";
import {NavLink} from 'react-router-dom';

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
                to="/app/connect"  
            >
                <button id='btnConnectWallet'>Connect Wallet...</button>
            </NavLink>

            <br />
            <br />
            
            <NavLink 
                to="/app/authenticate?client_id=7TdKmdPQ1663168239000"  
            >
                <button id='btnAuthWallet'>Authenticate with Wallet...</button>
            </NavLink>

            <br />
            <br />

            <NavLink 
                to="/api"  
            >
                <button id='btnApi'>APIs...</button>
            </NavLink>

            <br />
            <br />

            <NavLink 
                to="/app/sign"  
            >
                <button id='btnSignMessage'>Sign Message...</button>
            </NavLink>

        </div>
    )
  }
}

export default App;
