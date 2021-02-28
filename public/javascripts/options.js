/*
Chart Options Objects
*/
var tableOptions = {
    allowHtml: true,
    cssClassNames: { 
        headerCell: 'tableheader',
        tableCell: 'tablecell'
    },
    //sort: 'disable',
    sortColumn: 0,
    sortAscending: false,
    page: 'enable',
    pagingButtons: 'both',
    //startPage: 2,
};

var tableScaleOptions = {
    allowHtml: true,
    cssClassNames: { 
        tableCell: 'tablecell'
    }
    
};


// options object passed to chart wrapper
var chartOptionsTemplate = {
    intervals: { style: 'area' , color:'#d3d3d3'},
    curveType: 'line',
    explorer: {
        actions: ['dragToZoom', 'rightClickToReset'],
        maxZoomIn: 0.05,
        keepInBounds: true, 
    },
    legend: { 
        position: 'none' ,
        textStyle :{
            bold:true, 
            fontSize: 15,
            fontName: 'Helvetica'
            }

    },
    lineWidth:1.5,
    //backgroundColor: '#e6f2ff',
    //backgroundColor: {stroke: '#008080', strokeWidth :'2'},
    height:380,
    chartArea: {
        height: '90%',
        width: '85%',
        left: '10%'
        
        
    },
    vAxis: {
        viewWindowMode:'explicit',
        textStyle :{
            bold:true, 
            fontSize: 10,
            fontName: 'Helvetica'
            },
        titleTextStyle : {
            italic: false,
            bold: true,
            fontSize: 15,
            fontName: 'Helvetica'
        }
    },
    hAxis: {
        gridlines: {color: 'none'},
        format: 'MMM dd, yy',
        textStyle :{
            bold:true, 
            fontSize: 10,
            fontName: 'Helvetica'
            }
    },
    annotations: {
        boxStyle: {
        // Color of the box outline.
        stroke: '#888',
        // Thickness of the box outline.
        strokeWidth: 1,
        // x-radius of the corner curvature.
        rx: 10,
        // y-radius of the corner curvature.
        ry: 10,
        // Attributes for linear gradient fill.
        gradient: {
                // Start color for gradient.
                color1: '#fbf6a7',
                // Finish color for gradient.
                color2: '#33b679',
                // Where on the boundary to start and
                // end the color1/color2 gradient,
                // relative to the upper left corner
                // of the boundary.
                x1: '0%', y1: '0%',
                x2: '100%', y2: '100%',
                // If true, the boundary for x1,
                // y1, x2, and y2 is the box. If
                // false, it's the entire chart.
                useObjectBoundingBoxUnits: true
            }
        }
    },
    tooltip: { isHtml: true },
    // legend colorurs change and won't match customs
    // certainty dashed line colour
    colors: ['#a9a9a9']//,'#d73027','#f46d43','#fdae61','#fee090','#ffffbf','#e0f3f8','#abd9e9','#74add1','#4575b4','#4575b4']
}
    
// options for control (DEV:parameterize constants between chart and control)
var datepickerOptions = {
    filterColumnIndex: 0,
    ui : {
        snapToData: true,
        minRangeSize: 200000000, // milliseconds about 2 days
        chartOptions : {
            intervals: { style: 'area' , color:'#d3d3d3'},
            height:66,
            lineWidth:1.0,
            chartArea : {
                width: '85%',
                left: '10%'
            },
            vAxis: {
                viewWindowMode:'explicit',
                viewWindow: {
                min:-10
                }
            },
            hAxis: {
                gridlines: {color: 'none'},
                format: 'MMM dd, yy',
                textStyle :{
                    bold:true, 
                    fontSize: 10,
                    fontName: 'Helvetica'
                    }
            },
            colors: ['#a9a9a9']
            
        }
        
    }
    
}

var candleOptionsTemplate = {
        legend : {
            position:'top',
            textStyle :{
                bold:true, 
                fontSize: 15,
                fontName: 'Helvetica'
                }
        },
        //466
        height:380,
        hAxis: {
            textStyle :{
            bold:true, 
            fontSize: 10,
            fontName: 'Helvetica'
            }
        },
        vAxis: {
            textStyle :{
            bold:true, 
            italic: false,
            fontSize: 10,
            fontName: 'Helvetica'
            },
            titleTextStyle :{
                bold:true, 
                italic: false,
                fontSize: 15,
                fontName: 'Helvetica'
            }

            
        },
        chartArea: {
            height: '80%',
            width: '85%'
            
        },
        intervals: { style: 'boxes' , color:'black', boxWidth:1},
        //pointSize : 5,
        series: {
            0: { pointShape: { 
                    type: 'star',
                    sides: 2, 
                    rotation: 90
                },
                pointSize : 25,
                dataOpacity: 0.8,
                //dent: 0.0005

            },
            1: {
                pointShape : { size: 7, type: 'square', color: 'red' } // legend symbol (format at cell level overides markers)
            }
        },
        colors: ['#795548'],
        explorer: {
            actions: ['dragToZoom', 'rightClickToReset'],
            maxZoomIn: 0.05,
            keepInBounds: true, 
        },
        tooltip: { isHtml: true }
        
        //seriesType: 'candlesticks',
        //series: {1: {type: 'line' ,color:'black', visibleInLegend: true}, 0 :{visibleInLegend: false}}

}


var changeViewOptionsTemplate = {
    intervals: { style: 'area' , color:'#d3d3d3'},
    curveType: 'line',
    explorer: {
        actions: ['dragToZoom', 'rightClickToReset'],
        maxZoomIn: 0.05,
        keepInBounds: true
    },
    legend: { 
        position: 'none',
        textStyle :{
            bold:true, 
            fontSize: 15,
            fontName: 'Helvetica'
            }
     },
    lineWidth:1.5,
    //backgroundColor: '#e6f2ff',
    //backgroundColor: {stroke: '#008080', strokeWidth :'2'},
    height:380,
    chartArea: {
        height: '90%',
        width: '85%',
        left: '10%'
        
    },
    hAxis: {
    gridlines: {color: 'none'},
    textStyle :{
        bold:true, 
        fontSize: 10,
        fontName: 'Helvetica'
        },
    //textPosition: 'none',
    //ticks: hticks,
    showTextEvery:'automatic'
    
    },
    vAxis: {
        viewWindowMode:'explicit',
        textStyle :{
            bold:true, 
            fontSize: 10,
            fontName: 'Helvetica'
            },
        titleTextStyle : {
            bold:true,
            italic: false,
            fontSize: 15,
            fontName: 'Helvetica'
        }
    },
    annotations: {
        boxStyle: {
        // Color of the box outline.
        stroke: '#888',
        // Thickness of the box outline.
        strokeWidth: 1,
        // x-radius of the corner curvature.
        rx: 10,
        // y-radius of the corner curvature.
        ry: 10,
        // Attributes for linear gradient fill.
        gradient: {
                // Start color for gradient.
                color1: '#fbf6a7',
                // Finish color for gradient.
                color2: '#33b679',
                // Where on the boundary to start and
                // end the color1/color2 gradient,
                // relative to the upper left corner
                // of the boundary.
                x1: '0%', y1: '0%',
                x2: '100%', y2: '100%',
                // If true, the boundary for x1,
                // y1, x2, and y2 is the box. If
                // false, it's the entire chart.
                useObjectBoundingBoxUnits: true
            }
        }
    },
    tooltip: { isHtml: true },
    colors: ['#a9a9a9']
}

var changeViewSliderOptions = {
    filterColumnIndex: 0,
    ui : {
        snapToData: true,
        minRangeSize: 3, // time units
        chartOptions : {
            intervals: { style: 'area' , color:'#d3d3d3'},
            height:66,
            lineWidth:1.0,
            chartArea : {
                width: '85%',
                left: '10%'
            },
            vAxis: {
                viewWindowMode:'explicit',
                viewWindow: {
                min:-10
                }
            },
            hAxis: {
                gridlines: {color: 'none'},
                textStyle :{
                    bold:true, 
                    fontSize: 10,
                    fontName: 'Helvetica'
                },
                //textPosition: 'none',
                //ticks: hticks,
                showTextEvery:'automatic'
            },
            colors: ['#a9a9a9']
            
            
        }
    }
}