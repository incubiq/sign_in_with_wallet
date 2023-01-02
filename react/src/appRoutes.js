import React, { Component, Suspense } from "react";
import {Route, Routes, Navigate  } from 'react-router-dom';

// default theming
import {getTheme, getStyles} from "./assets/themes/cardano"; 
import {WidgetLoading} from "./utils/widgetLoading"; 

// authentication apps
const AuthConnect  = React.lazy(() => import ("./components/authConnect"));              // to connect with wallet 
const AuthAuthorize  = React.lazy(() => import ("./components/authAuthorize"));          // to authorise session via oAuth
const AuthLogin  = React.lazy(() => import ("./components/authLogin"));                   // this one gives a login into SIWW (used by admin user)

// /app route require user login into SIWW
const AppLogged  = React.lazy(() => import ("./components/appLogged"));
const AppConfigure  = React.lazy(() => import ("./components/appConfigure"));


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
        <div id="siww-login-container" style={styles.container}>
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
                    fallback={this.renderBackground()}>
                    <App
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                        host={this.props.host}
                    />
                </Suspense> 
                } exact />

            <Route  path="connect/cardano" element={
                <Suspense 
                    fallback={this.renderBackground()}>
                    <AuthConnect
                        // utils
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                        host={this.props.host}
                        chain="cardano"

                        // default themes
                        theme={getTheme()}
                        styles={getStyles()}
                    />
                </Suspense> 
                } exact />


            {/* For now, we Redirect all authentication calls to /SIWW to /Cardano */}
            <Route  path="/auth/siww" element={ <Navigate to={"/auth/cardano"+window.location.search} /> } />

            <Route  path="/auth/cardano" element={
                <Suspense 
                    fallback={this.renderBackground()}>
                    <AuthAuthorize
                        // utils
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                        host={this.props.host}
                        onRedirect={this.props.onSoftRedirect}
                        chain="cardano"

                        // cookie
                        AuthenticationCookieName={this.props.AuthenticationCookieName}
                        AuthenticationCookieToken={this.props.AuthenticationCookieToken}
                        AuthenticationCookieSecret={this.props.AuthenticationCookieSecret}
                        onUpdateCookie = {this.props.onUpdateCookie}

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

            <Route  path="/auth/login" element={
            // route for logging user as admin in admin panel            
            <Suspense 
                    fallback={this.renderBackground()}>
                    <AuthLogin

                        // utils
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                        host={this.props.host}
                        onRedirect={this.props.onSoftRedirect}
                        chain="cardano"             // keep this for now, as it is how we will log user into SIWW (todo: later we will need to connect via all possible chains)

                        // cookie
                        AuthenticationCookieName={this.props.AuthenticationCookieName}
                        AuthenticationCookieToken={this.props.AuthenticationCookieToken}
                        AuthenticationCookieSecret={this.props.AuthenticationCookieSecret}
                        onUpdateCookie = {this.props.onUpdateCookie}

                        // webapp    
                        theme={getTheme()}
                        styles={getStyles()}
                    />
                </Suspense> 
                } exact />

            <Route  path="/app" element={
            // route for a logged user into the admin panel
                <Suspense 
                    fallback={this.renderBackground()}>
                    <AppLogged

                        // utils
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                        host={this.props.host}
                        onRedirect={this.props.onSoftRedirect}

                        // cookie
                        AuthenticationCookieName={this.props.AuthenticationCookieName}
                        AuthenticationCookieToken={this.props.AuthenticationCookieToken}
                        AuthenticationCookieSecret={this.props.AuthenticationCookieSecret}
                        onUpdateCookie = {this.props.onUpdateCookie}

                        // themes
                        theme={getTheme()}
                        styles={getStyles()}
                    />
                </Suspense> 
                } exact />

            <Route  path="/app/configure" element={
            // route for configuring a domain by an admin
                <Suspense 
                    fallback={this.renderBackground()}>
                    <AppConfigure

                        // utils
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                        host={this.props.host}
                        onRedirect={this.props.onSoftRedirect}
                        chain="cardano"

                        // cookie
                        AuthenticationCookieName={this.props.AuthenticationCookieName}
                        AuthenticationCookieToken={this.props.AuthenticationCookieToken}
                        AuthenticationCookieSecret={this.props.AuthenticationCookieSecret}
                        onUpdateCookie = {this.props.onUpdateCookie}

                        // webapp    
                        webAppId = {this.props.webAppId}
                        webAppName = {this.props.webAppName}
                        webAppDomain = {this.props.webAppDomain}
                        theme={getTheme()}
                        styles={getStyles()}
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

            <Route  path="/sign/cardano" element={
                <Suspense 
                    fallback={<div>Sign message Cardano...</div>}>
                    <AuthConnect
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                        host={this.props.host}
                        chain="cardano"

                        // default themes
                        theme={getTheme()}
                        styles={getStyles()}
                    />
                </Suspense> 
                } exact />
        </Routes>

  </>
  );
  }
}

export default AppRoutes;
