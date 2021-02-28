// hide,show menus
function dropdown(id) {
    var x = document.getElementById(id);
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
    } else { 
        x.className = x.className.replace(" w3-show", "");
    }
    
}

// scroll event
window.onscroll = function() {
    setViewLabel();
    
};

// header
var setViewLabel = function (){
    
    // determine current view and set header
    var best_view;
    var delta = 10000000;
    for(var i=0; i<headings.length; i++){
        //console.log(headings[i].innerHTML);
        // smallest abs value from top of screen
        if(Math.abs(headings[i].getBoundingClientRect().bottom) < delta){
            best_view = headings[i].innerHTML;
            delta = Math.abs(headings[i].getBoundingClientRect().bottom) - 100;
            // offset by 100, can tweak this
            
        }
    }

    if(best_view != current_view){
        var view_label = document.getElementById('viewLabel');
        view_label.innerHTML = "<strong><b>"+best_view+"</b></strong>";
        current_view = best_view;
    }
    //console.log(best_view);
    //console.log(delta);
}

// resize
function reSize(){
    
    setHeader();
    addAllOverlays();
    setTimeout(updateFromResize, 500);
    setTopMargin();

    
}

function setHeader(){
    var sidebar = document.getElementById("mySidebar");
    var header = document.getElementsByClassName('headerBorder')[0];
    var width = window.outerWidth;
    
    // view mode logic
    if(width > 992){
        header.style["margin-left"] = '21.5em';
        sidebar.style.display = 'block';
    }
    else{
        header.style["margin-left"] = '0em';
        sidebar.style.display = 'none';
    }
}

function setTopMargin(){
    // adjust top margin for header
    var main = document.getElementById("main");
    var header = document.getElementsByClassName('headerBorder')[0];
    var new_em = String((header.offsetHeight/16)-3.05) + 'em';
    main.style['marginTop'] = new_em;
}
