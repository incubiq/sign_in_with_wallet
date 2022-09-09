import React, { Component, Suspense } from "react";
import {Route, Routes, useNavigate } from 'react-router-dom';

const AppConnect  = React.lazy(() => import ("./components/appConnect"));
const AppAuth  = React.lazy(() => import ("./components/appAuth"));
const AppAuthApi  = React.lazy(() => import ("./api/appAuthApi"));
const App  = React.lazy(() => import ("./app"));

/* 
 *      Routing class
 */

class AppRoutes extends Component {

  constructor(props) {
    super(props);
    this.state={
      version: ""
    }
  }

/*
*     all for APP routes 
*/

  render() {
    return (
      <>

        <Routes>            
            <Route  path="/" element={
                <Suspense 
                    fallback={<div>Loading React home...</div>}>
                    <App
                        version={this.state.version}
                    />
                </Suspense> 
                } exact />

            <Route  path="app/connect" element={
                <Suspense 
                    fallback={<div>Loading Connector...</div>}>
                    <AppConnect
                        version={this.state.version}
                    />
                </Suspense> 
                } exact />

            <Route  path="/app/auth" element={
                <Suspense 
                    fallback={<div>Loading Auth...</div>}>
                    <AppAuth
                        version={this.state.version}
                    />
                </Suspense> 
                } exact />

            <Route  path="/api" element={
                <Suspense 
                    fallback={<div>Loading APIs...</div>}>
                    <AppAuthApi
                        version={this.state.version}
                    />
                </Suspense> 
                } exact />

        </Routes>

  </>
  );
  }
}

export default AppRoutes;
