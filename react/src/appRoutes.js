import React, { Component, Suspense } from "react";
import {Route, Routes, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

// default theming
import {getTheme, getStyles} from "./assets/themes/cardano"; 
import {WidgetLoading} from "./utils/widgetLoading"; 

const AppConnect  = React.lazy(() => import ("./components/appConnect"));
const AppAuthenticate  = React.lazy(() => import ("./components/appAuthenticate"));
const AppAuthorize  = React.lazy(() => import ("./components/appAuthorize"));
const AppAuthApi  = React.lazy(() => import ("./api/appAuthApi"));
const App  = React.lazy(() => import ("./app"));

const socket = io("/client");        

/* 
 *      Routing class
 */

let didSocketConnect=false;
let didMount=false;
class AppRoutes extends Component {

  constructor(props) {
    super(props);
    this.state={
        version: "",
        didSocketConnect:false
    }

    socket.on("connect", _socket => { 
        didSocketConnect=true;
        if(didMount && this.state.didSocketConnect!==didSocketConnect) {
            this.setState({didSocketConnect: didSocketConnect});
        }
    });        

  }
  componentDidMount() {
    didMount=true;
    this.setState({didSocketConnect: didSocketConnect});
  }
  componentWillUnmount() {
    didMount=false;
  }

  getSocket( ){
    return socket;
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

            <Route  path="app/connect" element={
                <Suspense 
                    fallback={this.renderBackground()}>
                    <AppConnect
                        version={this.state.version}
                        didSocketConnect={this.state.didSocketConnect}
                        getSocket={this.getSocket}
                        theme={getTheme()}
                        styles={getStyles()}
                    />
                </Suspense> 
                } exact />

            <Route  path="/app/authenticate" element={
                <Suspense 
                    fallback={this.renderBackground()}>
                    <AppAuthenticate
                        version={this.state.version}
                        didSocketConnect={this.state.didSocketConnect}
                        getSocket={this.getSocket}
                        theme={getTheme()}
                        styles={getStyles()}
                        onRedirect={this.props.onSoftRedirect}
                    />
                </Suspense> 
                } exact />

            <Route  path="/app/authorize" element={
                <Suspense 
                    fallback={this.renderBackground()}>
                    <AppAuthorize
                        version={this.state.version}
                        didSocketConnect={this.state.didSocketConnect}
                        getSocket={this.getSocket}
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
