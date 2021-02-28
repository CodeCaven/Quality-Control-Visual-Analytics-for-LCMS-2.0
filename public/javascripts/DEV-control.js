 // convert a string to date (map)
 function convert_date(date){
    return new Date(date);
}

// convert from JSON (map)
function convert_JSON(text){
    return JSON.parse(text);
}

// nav dropdown function
function create_navbar_dropdown(){

    // get dropdown
    let nav_dropdown = document.getElementById('navbar-machines');

    // add metabolomics
    if(metabolomics.length > 0){
        let new_header = document.createElement("div");
        let new_divider = document.createElement("div");
        new_header.className = "dropdown-header";
        new_header.innerHTML = "METABOLOMICS";
        new_divider.className = "dropdown-divider";
        new_header.append(new_divider);
        nav_dropdown.append(new_header);

        for(let i=0; i<metabolomics.length; i++){
            let new_link = document.createElement("a");
            new_link.setAttribute("data-chart-menu", "METABOLOMICS"); // for chart change
            let new_icon = document.createElement("span");
            // link
            new_link.href = "#";
            new_link.className = "dropdown-item";
            for(let machine in metabolomics[i]){
                new_link.innerHTML = machine;
                // icon
                if(metabolomics[i][machine] > 0){
                    new_icon.className = "fas fa-times text-danger";
                }
                else{
                    new_icon.className = "fas fa-check text-success";
                }
            }
            // append to dropdowm
            new_link.append(new_icon);
            nav_dropdown.append(new_link);
        }
    }

    // add space
    let new_break = document.createElement("br");
    nav_dropdown.append(new_break);

    // add proteomics
    if(proteomics.length > 0){
        let new_header = document.createElement("div");
        let new_divider = document.createElement("div");
        new_header.className = "dropdown-header";
        new_header.innerHTML = "PROTEOMICS";
        new_divider.className = "dropdown-divider";
        new_header.append(new_divider);
        nav_dropdown.append(new_header);

        for(let i=0; i<proteomics.length; i++){
            let new_link = document.createElement("a");
            new_link.setAttribute("data-chart-menu", "PROTEOMICS"); // for chart change
            let new_icon = document.createElement("span");
            // link
            new_link.href = "#";
            new_link.className = "dropdown-item";
            for(let machine in proteomics[i]){
                new_link.innerHTML = machine;
                // icon
                if(proteomics[i][machine] > 0){
                    new_icon.className = "fas fa-times text-danger";
                }
                else{
                    new_icon.className = "fas fa-check text-success";
                }
            }
            // append to dropdowm
            new_link.append(new_icon);
            nav_dropdown.append(new_link);
        }
    }
}

// Tooltips (javascript.info)
document.onmouseover = function(event) {
    let target = event.target;
    
    // if we have tooltip HTML...
    let tooltipHtml = target.dataset.tooltip;
    if (!tooltipHtml) return;
    // ...create the tooltip element
    tooltipElem = document.createElement('div');
    tooltipElem.className = 'tooltipCustom trans-o';
    tooltipElem.innerHTML = tooltipHtml;
    tooltipElem.style.opacity = 0;
    document.body.append(tooltipElem);

    // position it above the annotated element (top-center)
    let coords = target.getBoundingClientRect();

    let left = coords.left + (target.offsetWidth - tooltipElem.offsetWidth) / 2;
    if (left < 0) left = 0; // don't cross the left window edge
    
    let top;
    if(target.classList.contains("date")){
        top = coords.top - tooltipElem.offsetHeight - 30; // lift date tooltip above window
    }
    else{
        top = coords.top - tooltipElem.offsetHeight - 5;
    }
    
    if (top < 0) { // if crossing the top window edge, show below instead
        top = coords.top + target.offsetHeight + 5;
    }

    tooltipElem.style.left = left + 'px';
    tooltipElem.style.top = top + 'px';
    tooltipElem.style.opacity = 1;
};

document.onmouseout = function(e) {
        if (tooltipElem) {
            tooltipElem.remove();
            tooltipElem = null;
    }  
};

// handle change to chart page  and reload
document.onclick = function(event){
    
    var target = event.target;
    var metric = "Mass Error (ppm)";
    var experiment;
    var machine;

    if(target.hasAttribute("data-chart-menu")){
        machine = target.childNodes[0].data;
        experiment = target.getAttribute("data-chart-menu");
    }
    else if(target.hasAttribute("data-chart-front")){
        machine = target.parentElement.childNodes[0].innerHTML;
        experiment = target.parentElement.childNodes[1].innerHTML;
    }
    else if(target.hasAttribute("data-chart-back")){
        let tile = target.parentElement.parentElement.parentElement.parentElement;
        let tile_front = tile.childNodes[0].childNodes[0];
        machine = tile_front.childNodes[0].innerHTML;
        experiment = tile_front.childNodes[1].innerHTML;
        metric = target.getAttribute("data-chart-back");
    }
    else if(target.hasAttribute("data-reload")){ // reload
        var new_path = "http://" + window.location.hostname + ":" + window.location.port
        window.location.assign(new_path);
        return;
    }
    else{
        return;
    }

    // create query string
    var query = new URLSearchParams();
    query.append("machine", machine);
    query.append("experiment", experiment);
    query.append("metric", metric);

    // redirect to new page with query string
    var new_path = "http://" + window.location.hostname + ":" + window.location.port + "/" + experiment.toLowerCase()
                        + "?" + query.toString();
    window.location.assign(new_path);
};

function diff_days(date1){
    // diff in days between today and date (now not working)
    var today = new Date();
    today = new Date(today.toLocaleDateString());
    date1 = new Date(date1.toLocaleDateString());
    var diff = today.getTime() - date1.getTime();
    return Math.floor(Math.random() * 10); //Math.floor(diff/(1000 * 60 * 60 * 24)); 
}

function get_time(date){
    // remove seconds (using strings)
    let full_time = date.toLocaleTimeString();
    let end = full_time.substr(full_time.length-2);
    let start = full_time.substr(0, 5);
    if(start.charAt(start.length - 1) === ":"){
        start =start.substr(0, start.length-1);
    }
    let display_time = start + " " + end;
    return display_time;
}



