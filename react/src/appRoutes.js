import React, { Component, Suspense } from "react";
import {Route, Routes } from 'react-router-dom';

// default theming
import {getTheme, getStyles} from "./assets/themes/cardano"; 
import {WidgetLoading} from "./utils/widgetLoading"; 

const AppConnect  = React.lazy(() => import ("./components/appConnect"));
const AppAuthenticate  = React.lazy(() => import ("./components/appAuthenticate"));
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

  renderBackground() {
    let styles=getStyles();
    return (
        <div id="siwc-login-container" style={styles.container}>
            <WidgetLoading 
                isVisible = {true}
                fullHeight = {true}
                text = "Loading page, just a moment..."
            />
        </div>
    )
  }

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

            <Route  path="auth/connect" element={
                <Suspense 
                    fallback={this.renderBackground()}>
                    <AppConnect
                        version={this.state.version}
                        didSocketConnect={this.props.didSocketConnect}
                        getSocket={this.props.getSocket}
                        theme={getTheme()}
                        styles={getStyles()}
                    />
                </Suspense> 
                } exact />

            <Route  path="/auth/cardano" element={
                <Suspense 
                    fallback={this.renderBackground()}>
                    <AppAuthenticate
                        version={this.state.version}
                        didSocketConnect={this.props.didSocketConnect}
                        getSocket={this.props.getSocket}
                        theme={getTheme()}
                        styles={getStyles()}
                        onRedirect={this.props.onSoftRedirect}
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
