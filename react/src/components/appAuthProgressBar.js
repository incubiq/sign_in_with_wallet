import {Component} from "react";

class AppAuthProgressBar extends Component {

/*
 *          page inits
 */

    constructor(props) {
        super(props);   

        this.state={
            downloadTimer: null
        }        
    }

    componentDidMount() {
        let eltBar=document.getElementById("myLoginProgressBar");
        this.go({
            delay: 4000,
            eltCancel: null, 
            eltBar: eltBar,
            onElapsed: function() {
                if(this.props.idMessage) {
                    let eltMsg=document.getElementById(this.props.idMessage);
                    eltMsg.innerHTML="A few more seconds..."    
                }
            }.bind(this)
        });
        
    }

/*
 *          
 */

    go(objOptions) {
        let timer=window.setTimeout(() => {
            console.log("continuing!");
            if(objOptions.onElapsed)  {
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
        var inc=40;
        var timeleft = 0;
        if(this.state.downloadTimer===null && objOptions.eltBar!==null) {
            this.state.downloadTimer = setInterval(function(){
                if(timeleft >= 100){
                    clearInterval(this.state.downloadTimer);
                    this.downloadTimer=null;
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
        if(this.props.theme.color && this.props.theme.color.button_text) {
            styleCont.backgroundColor=this.props.theme.color.button_text;
            styleProgress.backgroundColor=this.props.theme.color.button;
        }

        return (
            <div className="progressBarContainer" style={styleCont}>
                <div id="myLoginProgressBar" style={styleProgress}></div>
            </div>
        )
    }
}

export default AppAuthProgressBar;
