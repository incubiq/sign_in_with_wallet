import {Component} from "react";

let isProgressRunning=false;
let progressInterval=null;
let progressTimer=null;

class ViewProgressBar extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);   

        this.state={
            isVisible: false
        }        
    }

    componentDidMount() {
        this.setState({isVisible: true});
        let eltBar=document.getElementById(this.props.id);
        if(!isProgressRunning) {
            isProgressRunning=true;
            this.go({
                delay: this.props.delay? this.props.delay: 4000,
                eltCancel: null, 
                eltBar: eltBar,
                onElapsed: function() {
                    // do we have a callback to call?
                    if(this.props.callback) {
                        this.props.callback();
                    }
    
                    // wait a bit more.. update UI
                    if(this.props.idMessage && this.state.isVisible) {
                        let eltMsg=document.getElementById(this.props.idMessage);
                        if(eltMsg) {
                            eltMsg.innerHTML="A few more seconds..."    
                        }
                    }
                }.bind(this)
            });            
        }
    }

    stopTimers() {
        isProgressRunning=false;
        if(progressInterval) {clearInterval(progressInterval); progressInterval=null;}
        if(progressTimer) {clearTimeout(progressTimer); progressTimer=null;}
   }

    componentWillUnmount() {
        this.setState({isVisible: false});
        this.stopTimers();
    }

/*
 *         UI/UX
 */

    go(objOptions) {
        progressTimer=window.setTimeout(function() {
            if(objOptions.onElapsed)  {
                console.log("continuing!");
                this.stopTimers();
                objOptions.onElapsed();
            }
        }.bind(this), objOptions.delay);

        if(objOptions.eltCancel) {
            objOptions.eltCancel.addEventListener("click", function () {
                this.stopTimers();
            }.bind(this));
        }
        this.fnLoadingEffect(objOptions);
    }

    fnLoadingEffect (objOptions) {
        var inc=this.props.inc? this.props.inc : 40;
        var timeleft = 0;
        if(progressInterval===null && objOptions.eltBar!==null) {
            progressInterval= setInterval(function(){
                if(timeleft >= 100){
                    this.stopTimers();
                }
                objOptions.eltBar.style.width = timeleft+"%";
                timeleft += (100/inc);
            }.bind(this), (objOptions.delay/inc));    
        }
    }

    render() {
        let styleCont={};
        let styleProgress={
            height:"8px",
            width: "0"
        };
        if(this.props.theme && this.props.theme.webapp.color && this.props.theme.webapp.color.button_text) {
            styleCont.backgroundColor=this.props.theme.webapp.color.button_text;
            styleProgress.backgroundColor=this.props.theme.webapp.color.button;
        }

        return (
            <div className="progressBarContainer" style={styleCont}>
                <div id={this.props.id} style={styleProgress}></div>
            </div>
        )
    }
}

export default ViewProgressBar;
