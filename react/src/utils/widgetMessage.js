
export const WidgetMessage = (props) => {

  return (
    <div className="transitoryMessage">
        {props.error? <img className="oops" src="/assets/images/oops.png"  alt="Oops" /> : ""}
        <div 
            className="headline"
            dangerouslySetInnerHTML={{__html: props.headline}}
        ></div>
        <div 
            className="text"
            dangerouslySetInnerHTML={{__html: props.text}}
        ></div>
    </div>
  )
};
