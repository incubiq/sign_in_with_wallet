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
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                    />
                </Suspense> 
                } exact />

            <Route  path="auth/connect" element={
                <Suspense 
                    fallback={this.renderBackground()}>
                    <AppConnect
                        version={this.props.version}
                        isDebug={this.props.isDebug}
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
                        // utils
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                        onRedirect={this.props.onSoftRedirect}
                        chain="cardano"

                        // cookie
                        AuthenticationCookieName={this.props.AuthenticationCookieName}
                        AuthenticationCookieToken={this.props.AuthenticationCookieToken}
                        AuthenticationCookieSecret={this.props.AuthenticationCookieSecret}

                        // sockets
                        didSocketConnect={this.props.didSocketConnect}
                        getSocket={this.props.getSocket}

                        // webapp
                        webAppId = {this.props.webAppId}
                        webAppName = {this.props.webAppName}
                        webAppDomain = {this.props.webAppDomain}
                        webApp = {this.props.webApp}              
                        theme={getTheme()}
                        styles={getStyles()}
                        // overload theme??
                        // TODO

                    />
                </Suspense> 
                } exact />

            <Route  path="/api" element={
                <Suspense 
                    fallback={<div>Loading APIs...</div>}>
                    <AppAuthApi
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                    />
                </Suspense> 
                } exact />

        </Routes>

  </>
  );
  }
}

export default AppRoutes;
