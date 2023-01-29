import React, { Component, Suspense } from "react";
import {Route, Routes  } from 'react-router-dom';

// default theming
import {WidgetLoading} from "./utils/widgetLoading"; 

// authentication apps
const AuthConnect  = React.lazy(() => import ("./components/authConnect"));              // to connect with wallet 
const AuthAuthorize  = React.lazy(() => import ("./components/authAuthorize"));          // to authorise session via oAuth
const AuthLogin  = React.lazy(() => import ("./components/authLogin"));                  // this one gives a login into SIWW (used by admin user)
const AuthError  = React.lazy(() => import ("./components/authError"));                  // just to display backend fwded errors in a nice UI

// admin panel apps
//const AdminViewBase  = React.lazy(() => import ("./components/adminViewBase"));
const AdminViewConfigure  = React.lazy(() => import ("./components/admin/viewConfigure"));
const AdminViewHome  = React.lazy(() => import ("./components/admin/viewHome"));
const AdminViewSettings  = React.lazy(() => import ("./components/admin/viewSettings"));
const AdminViewDomains  = React.lazy(() => import ("./components/admin/viewDomains"));


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
    return (
        <div id="siww-login-container" style={this.props.styles? this.props.styles.container: null}>
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
                        onRedirect={this.props.onSoftRedirect}
                    />
                </Suspense> 
                } exact />


            {/*  /auth/SIWW is our end-user authentication route in React app */}
            <Route  path="/auth/siww" element={
                <Suspense 
                    fallback={this.renderBackground()}>
                    <AuthAuthorize
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

                        // webapp
                        webAppId = {this.props.webAppId}
                        webAppName = {this.props.webAppName}
                        webAppDomain = {this.props.webAppDomain}
                        webApp = {this.props.webApp}              
                        theme={this.props.theme}
                        styles={this.props.styles}

                    />
                </Suspense> 
                } exact />

            <Route  path="/auth/error" element={
                // route for displaying error from backend failure (during the call from /dialog/authorize)
                <Suspense 
                    fallback={this.renderBackground()}>
                    <AuthError

                        // utils
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                        host={this.props.host}
                        onRedirect={this.props.onSoftRedirect}

                        // webapp    
                        theme={this.props.theme}
                        styles={this.props.styles}
                    />
                </Suspense> 
                } exact />

            <Route  path="/app" element={
            // route for a logged user into the admin panel
                <Suspense 
                    fallback={this.renderBackground()}>
                    <AdminViewHome

                        // utils
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                        host={this.props.host}
                        onRedirect={this.props.onSoftRedirect}

                        // cookie
                        AuthenticationCookieName={this.props.AdminCookieName}
                        AuthenticationCookieToken={this.props.AdminCookieToken}
                        AuthenticationCookieSecret={this.props.AdminCookieSecret}
                        onUpdateCookie = {this.props.onUpdateCookie}

                        // view
                        view = "home"
                    />
                </Suspense> 
                } exact />

            <Route  path="/app/domains" element={
            // route for a logged user into the admin panel
                <Suspense 
                    fallback={this.renderBackground()}>
                    <AdminViewDomains

                        // utils
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                        host={this.props.host}
                        onRedirect={this.props.onSoftRedirect}

                        // cookie
                        AuthenticationCookieName={this.props.AdminCookieName}
                        AuthenticationCookieToken={this.props.AdminCookieToken}
                        AuthenticationCookieSecret={this.props.AdminCookieSecret}
                        onUpdateCookie = {this.props.onUpdateCookie}

                        // view
                        view = "domains"

                        // webapp    
                        webAppId = {this.props.webAppId}
                        webAppName = {this.props.webAppName}
                        webAppDomain = {this.props.webAppDomain}
                        
                        // themes (for preview)
                        theme={this.props.theme}
                        styles={this.props.styles}
                    />
                </Suspense> 
                } exact />

            <Route  path="/app/settings" element={
            // route for a logged user into the admin panel
                <Suspense 
                    fallback={this.renderBackground()}>
                    <AdminViewSettings

                        // utils
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                        host={this.props.host}
                        onRedirect={this.props.onSoftRedirect}

                        // cookie
                        AuthenticationCookieName={this.props.AdminCookieName}
                        AuthenticationCookieToken={this.props.AdminCookieToken}
                        AuthenticationCookieSecret={this.props.AdminCookieSecret}
                        onUpdateCookie = {this.props.onUpdateCookie}

                        // view
                        view = "settings"
                    />
                </Suspense> 
                } exact />

            <Route  path="/app/configure" element={
            // route for configuring a domain by an admin
                <Suspense 
                    fallback={this.renderBackground()}>
                    <AdminViewConfigure

                        // utils
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                        host={this.props.host}
                        onRedirect={this.props.onSoftRedirect}

                        // cookie
                        AuthenticationCookieName={this.props.AdminCookieName}
                        AuthenticationCookieToken={this.props.AdminCookieToken}
                        AuthenticationCookieSecret={this.props.AdminCookieSecret}
                        onUpdateCookie = {this.props.onUpdateCookie}

                        // webapp    
                        webAppId = {this.props.webAppId}
                        webAppName = {this.props.webAppName}
                        webAppDomain = {this.props.webAppDomain}
                        theme={this.props.theme}
                        styles={this.props.styles}
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

{/* TEST ROUTES */}

            <Route  path="/auth/login" element={
                // DEPRECATED - route for logging user as admin in admin panel            
                <Suspense 
                        fallback={this.renderBackground()}>
                        <AuthLogin

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

                            // webapp    
                            theme={this.props.theme}
                            styles={this.props.styles}
                        />
                    </Suspense> 
                    } exact />

            <Route  path="connect/cardano" element={
            // DEPRECATED - route for testing cardano connector
                <Suspense 
                    fallback={this.renderBackground()}>
                    <AuthConnect
                        // utils
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                        host={this.props.host}

                        // default themes
                        theme={this.props.theme}
                        styles={this.props.styles}
                    />
                </Suspense> 
                } exact />

            <Route  path="/sign/cardano" element={
            // DEPRECATED - test route for cardano signMessage
                <Suspense 
                    fallback={<div>Sign message Cardano...</div>}>
                    <AuthConnect
                        version={this.props.version}
                        isDebug={this.props.isDebug}
                        host={this.props.host}

                        // default themes
                        theme={this.props.theme}
                        styles={this.props.styles}
                    />
                </Suspense> 
                } exact />
        </Routes>        
{/* END OF TEST ROUTES */}

  </>
  );
  }
}

export default AppRoutes;
