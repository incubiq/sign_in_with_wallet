import React, {Component} from "react";
import {NavLink} from 'react-router-dom';

class App extends Component {

  render( ){
    return (
        <div>
            
        <h2>[/auth routes] - Requires Wallet connection</h2>
            <NavLink 
                to="/connect/cardano"  
            >
                <button 
                    id='btnConnectWallet'
                    onClick={() => {
                            this.props.onRedirect("/connect/cardano")
                        }
                    }
                >
                    Connect Wallet...
                </button>
            </NavLink>

            <br />
            <br />
            
            <NavLink 
                to="/auth/siww?app_id=7TdKmdPQ1663168239000"  
            >
                <button 
                    id='btnAuthWallet'
                    onClick={() => {
                        this.props.onRedirect("/auth/siww?app_id=7TdKmdPQ1663168239000")
                    }
                }
                >
                    Authenticate with Wallet...
                </button>
            </NavLink>

            <br />
            <br />

            <NavLink 
                to="auth/siww?app_id=self"  
            >
                <button 
                    id='btnAdminPanel'
                    onClick={() => {
                        this.props.onRedirect("/auth/siww?app_id=self")
                    }
                }
                >
                    Authenticate into Admin Panel...
                </button>
            </NavLink>

            <br />
            <br />

            <NavLink 
                to="app"  
            >
                <button 
                    id='btnAdminPanel'
                    onClick={() => {
                        this.props.onRedirect("/app")
                    }
                }
                >
                    Open Admin Panel...
                </button>
            </NavLink>

        <h2>[/app routes] - Requires Login into SIWW</h2>
            <NavLink 
                to="/app/configure"  
            >
                <button id='btnApi'>Configure...</button>
            </NavLink>

            <br />
            <br />

        <h2>Misc others...</h2>
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
                to="/api"  
            >
                <button id='btnApi'>APIs...</button>
            </NavLink>

            <br />
            <br />

            <NavLink 
                to="/sign/cardano"  
            >
                <button id='btnSignMessage'>Sign Message...</button>
            </NavLink>

        </div>
    )
  }
}

export default App;
