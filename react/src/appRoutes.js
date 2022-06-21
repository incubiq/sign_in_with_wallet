import React, { Component, Suspense } from "react";
import {Route, Routes} from 'react-router-dom';

const AppDoc  = React.lazy(() => import ("./appDoc"));
const AppDemoAuth  = React.lazy(() => import ("./appAuth"));
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
                    fallback={<div>Loading App...</div>}>
                    <App
                        version={this.state.version}
                    />
                </Suspense> 
                } exact />

            <Route  path="/doc" element={
                <Suspense 
                    fallback={<div>Loading Documentation...</div>}>
                    <AppDoc 
                        version={this.state.version}
                    />
                </Suspense> 
                } exact />

            <Route  path="/connect" element={
                <Suspense 
                    fallback={<div>Loading Auth...</div>}>
                    <AppDemoAuth
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
