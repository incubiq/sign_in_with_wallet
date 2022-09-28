import {Component} from "react";

class ViewProgressBar extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);   

        this.state={
            downloadTimer: null,
            isVisible: false
        }        
    }

    componentDidMount() {
        this.setState({isVisible: true});
        let eltBar=document.getElementById(this.props.id);
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

    componentWillUnmount() {
        this.setState({isVisible: false});
        if(this.state.downloadTimer) {
            clearInterval(this.state.downloadTimer);
            this.setState({downloadTimer : null});
        }
    }

/*
 *         UI/UX
 */

    go(objOptions) {
        let timer=window.setTimeout(() => {
            if(objOptions.onElapsed)  {
                console.log("continuing!");
                objOptions.onElapsed();
            }
        }, objOptions.delay);

        if(objOptions.eltCancel) {
            objOptions.eltCancel.addEventListener("click", function () {
                if(timer) {
                    window.clearTimeout(timer);
                    timer=null;
                }
            });
        }
        this.fnLoadingEffect(objOptions);
    }

    fnLoadingEffect (objOptions) {
        var inc=this.props.inc? this.props.inc : 40;
        var timeleft = 0;
        if(this.state.downloadTimer===null && objOptions.eltBar!==null) {
            let _timer= setInterval(function(){
                if(timeleft >= 100){
                    clearInterval(this.state.downloadTimer);
                    this.downloadTimer=null;
                }
                objOptions.eltBar.style.width = timeleft+"%";
                timeleft += (100/inc);
            }.bind(this), (objOptions.delay/inc));    

            this.setState({downloadTimer: _timer});
        }
    }

    render() {
        let styleCont={};
        let styleProgress={
            height:"8px",
            width: "0"
        };
        if(this.props.theme.webapp.color && this.props.theme.webapp.color.button_text) {
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
