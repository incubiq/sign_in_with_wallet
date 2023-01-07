
export const WidgetMessage = (props) => {

  return (
    <div className="transitoryMessage">
        {props.error? <img className="oops" src="/assets/images/oops.png"  alt="Oops" /> : ""}
        <span className="headline">{props.headline}</span>
        <span className="text">{props.text}</span>
    </div>
  )
};
