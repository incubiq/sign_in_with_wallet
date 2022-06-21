import React, {Component} from "react";
import { RedocStandalone } from 'redoc';
import "./doc.css";

class AppDoc extends Component {

  render( ){
      // don t bother with themes now
      let objTheme={};

      return (
        <div className="">

          <RedocStandalone 
            specUrl="/doc/apidoc.json"
            options={{
              nativeScrollbars: true,
              theme: objTheme
            }}
          />

        </div>
      );

  }
}

export default AppDoc;
