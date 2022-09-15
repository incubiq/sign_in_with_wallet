import './widgetLoading.css'

export const WidgetLoading = (props) => {

  const _getLoadingStyle = () => {
    let style="loading "
    if(props.image) {
      style+="withImage";
    }
    if(props.fullHeight) {
      style+=" fullHeight";
    }
    return style;
  }

  return (
    <div className="background">
      {props.isVisible ? 
      <div className={_getLoadingStyle()}>

        {props.hasSpinner ? 
          <div />
        : ""
        }

        {props.image? 
          <img 
            className="backgroundImage"
            src={props.image} />
        : ""
        }

        <div 
          className="loadingText"
          dangerouslySetInnerHTML={{__html: props.text}}
        />
      </div>

      : ""
      }
      
    </div>
  )
};
