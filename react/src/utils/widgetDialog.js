
import React, {Component} from "react";
class WidgetDialog extends Component {

  render() {
    return (
      <>
      {this.props.isVisible? 
        <>
        <div className="semiOpaque"></div>
        <div className="dialog modal modal-login center-vh">
          <div className="siww-header ">
            {this.props.title}
          </div>

          <div className="content">
              <span>{this.props.message}</span>
          </div>

          <div className="siww-footer">
            {this.props.firstButtonText? 
            <div className="btn btn-tiny right btn-primary"
                    onClick = {( )=> {this.props.onConfirm(1);}}
                >
                  {this.props.firstButtonText}
            </div>
            :""}

            {this.props.secondButtonText? 
              <div className="btn btn-tiny right btn-primary"
                onClick = {( )=> {this.props.onConfirm(2);}}
              >
                  {this.props.secondButtonText}
              </div>
            :""}

          </div>
        </div>
      </>
      
      :""}
      </>
    )
  }
}
export default WidgetDialog;