var async = require('async');
var db = require('../models/metabDB');
let colormap = require('colormap');
const colorbrewer = require('colorbrewer');

// Get data for Metabolomics Charts
exports.metab_home = function(req, res) {
    // retrieve query strings
    var machine = req.query.machine;
    var experiment = req.query.experiment;
    var display_metric = req.query.metric;
    var machine_data = {};
    var machine_type;

    // number of runs
    const RUNS = 20;

    // get data sqls
    let runs_sql = "SELECT run_id, date_time FROM qc_run WHERE machine_id = " +
                    "(SELECT machine_id FROM machine WHERE machine_name = '" + machine + "')" +
                    " AND experiment_id = (SELECT experiment_id FROM experiment WHERE experiment_type = 'metabolomics')" + 
                    "ORDER BY date_time DESC LIMIT " + RUNS;

    let component_sql = "SELECT component_name,component_mode, component_id FROM sample_component " +
                        " WHERE component_name <>" + "'Metab Digest'" + 
                        " AND experiment_id = (SELECT experiment_id FROM experiment WHERE experiment_type = 'metabolomics')" + 
                        " ORDER BY component_name";

    let lcms_metrics_sql = "SELECT display_order, display_name, metric_id FROM metric WHERE display_order > 0 " + 
                            "AND use_metab='Y' AND metric_type = 'mzmine' ORDER BY display_order";

    let pressure_metrics_sql = "SELECT display_order, display_name, metric_id FROM metric WHERE display_order > 0 " + 
                            "AND use_metab='Y' AND metric_type = 'thermo' ORDER BY display_order";

    let machine_type_sql = "SELECT machine_type FROM machine WHERE machine_name = '" + machine + "'";

    // execute query as a promise
    let p1 = db.execute(runs_sql).then(
            result => machine_data["run_data"] = JSON.parse(JSON.stringify(result))
        ).catch(
            error => error_handle(error)
        );

    // execute query as a promise
    let p2 = db.execute(component_sql).then(
        result => machine_data["components"] = JSON.parse(JSON.stringify(result))
    ).catch(
        error => error_handle(error)
    );

    // execute query as a promise
    let p3 = db.execute(lcms_metrics_sql).then(
        result => machine_data["lcms_metrics"] = JSON.parse(JSON.stringify(result))
    ).catch(
        error => error_handle(error)
    );

    // execute query as a promise
    let p4 = db.execute(machine_type_sql).then(
        result => machine_type = result[0].machine_type
    ).catch(
        error => error_handle(error)
    );

    // execute query as a promise
    let p5 = db.execute(pressure_metrics_sql).then(
        result => machine_data["pressure_metrics"] = JSON.parse(JSON.stringify(result))
    ).catch(
        error => error_handle(error)
    );

    // wait for all the promises
    Promise.all([p1, p2, p3, p4, p5]).then(
        result => add_run_data()
    ).catch(
        error => error_handle(error)
    );

    async function add_run_data(){
        /*CHROMATOGRAMS*/
        // loop through components
        for(let comp in machine_data["components"]){
            var component_id = machine_data["components"][comp].component_id;
            var chromatograms = [];
            // loop through runs 
            for(let run in machine_data["run_data"]){
                var run_id = machine_data["run_data"][run].run_id;

                // get chromatograms data
                var sql = "SELECT chrom_data FROM chromatogram WHERE component_id = " + 
                            component_id + " AND run_id = " + run_id;
                await db.execute(sql).then(
                            result => chromatograms.push(JSON.parse(JSON.stringify(result)))
                    ).catch(
                        error => error_handle(error) 
                    );  
            }
            machine_data["components"][comp]["chromatograms"] = chromatograms;
        }
        
        /*PRESSURE PROFILES*/
        // loop through runs
        if(machine_type == "thermo"){
            for(let run in machine_data["run_data"]){
                var run_id = machine_data["run_data"][run].run_id;
                var pressure = [];
                // get pressure profile data
                var sql = "SELECT pressure_data FROM pressure_profile WHERE run_id = " + run_id +
                            " AND pump_type = 'mp'"; // only one metab pump but filter anyway

                await db.execute(sql).then(
                    result => pressure.push(JSON.parse(JSON.stringify(result)))
                ).catch(
                    error => error_handle(error) 
                ); 
                machine_data["run_data"][run]["pressure_profile"] = pressure;
            } 
        }
        
        /* SUMMARY DATA*/
        for(let run in machine_data["run_data"]){
            var run_id = machine_data["run_data"][run].run_id;
            // get summary data
            var sql = "SELECT summary FROM qc_run WHERE run_id = " + run_id +
                        " AND completed = 'Y'"; 

            await db.execute(sql).then(
                result => machine_data["run_data"][run]["summary"]= JSON.parse(JSON.stringify(result))
            ).catch(
                error => error_handle(error) 
            ); 
        } 

        /* LC-MS METRICS */
        // component
        for(let component in machine_data["components"]){
            var comp_id = machine_data["components"][component].component_id;
            machine_data["components"][component]["lcms_metrics"] = {};
            // metrics
            for(let metric in machine_data["lcms_metrics"]){
                var metric_id = machine_data["lcms_metrics"][metric].metric_id;
                var metric_name = machine_data["lcms_metrics"][metric].display_name;
                var metric_values = [];
                // runs
                for(let run in machine_data["run_data"]){
                    var run_id = machine_data["run_data"][run].run_id;
                    
                    var sql = "SELECT value FROM measurement WHERE run_id = " + run_id +
                            " AND metric_id = " + metric_id +
                            " AND component_id = " + comp_id;
                    await db.execute(sql).then(
                        result => metric_values.push(JSON.parse(JSON.stringify(result))[0].value)
                    ).catch(
                        error => error_handle(error) 
                    ); 

                }
                machine_data["components"][component]["lcms_metrics"][metric_name] = metric_values;

                if(component == 0){ // only do once (per metric not per component)
                    // get thresholds
                    var sql = "SELECT threshold_trigger, threshold_low, threshold_high FROM threshold " +
                                "WHERE metric_id = " + metric_id + 
                                " AND experiment_id = (SELECT experiment_id FROM experiment WHERE experiment_type = 'metabolomics')";
                    await db.execute(sql).then(
                        result =>  machine_data["lcms_metrics"][metric]["thresholds"] = JSON.parse(JSON.stringify(result))[0]
                    ).catch(
                        error => error_handle(error) 
                    ); 
                }
            }  
        }

        /* PRESSURE METRICS */
        // metrics
        for(let metric in machine_data["pressure_metrics"]){
            
            var metric_id = machine_data["pressure_metrics"][metric].metric_id;
            var metric_values = [];
            // runs
            for(let run in machine_data["run_data"]){
                var run_id = machine_data["run_data"][run].run_id;
                
                var sql = "SELECT value FROM measurement WHERE run_id = " + run_id +
                        " AND metric_id = " + metric_id +
                        " AND component_id = (SELECT component_id FROM sample_component WHERE " +
                            " component_name = 'Metab Digest')";
                await db.execute(sql).then(
                    result => metric_values.push(JSON.parse(JSON.stringify(result))[0].value)
                ).catch(
                    error => error_handle(error) 
                ); 
            }
            machine_data["pressure_metrics"][metric]["values"] = metric_values;
        }  

        /* STATS - LC-MS */
        // component
        for(let component in machine_data["components"]){
            var comp_id = machine_data["components"][component].component_id;
            machine_data["components"][component]["stats"] = {};
            for(let metric in machine_data["lcms_metrics"]){
                var metric_id = machine_data["lcms_metrics"][metric].metric_id;
                var metric_name = machine_data["lcms_metrics"][metric].display_name;
                // no box plots for normalised metrics
                if(metric_name != "Area (normalised)" && metric_name != "Height (normalised)"){
                    sql = "SELECT mean, std, min, 25_percent, 50_percent, 75_percent, max FROM STAT where " +
                            " machine_id = (SELECT machine_id FROM machine WHERE machine_name = '" + machine + "')" +
                            " AND component_id = " + comp_id + " AND " +
                            " metric_id = " + metric_id;
                    await db.execute(sql).then(
                        result => machine_data["components"][component]["stats"][metric_name]=JSON.parse(JSON.stringify(result))[0]
                    ).catch(
                        error => error_handle(error) 
                    ); 
                }

            }
        }

        /* STATS - Pressure Metrics */
        for(let metric in machine_data["pressure_metrics"]){
            var metric_id = machine_data["pressure_metrics"][metric].metric_id;
            machine_data["pressure_metrics"][metric]["stats"] = {};
            sql = "SELECT mean, std, min, 25_percent, 50_percent, 75_percent, max FROM STAT where " +
                    " machine_id = (SELECT machine_id FROM machine WHERE machine_name = '" + machine + "')" +
                    " AND component_id = (SELECT component_id FROM sample_component WHERE component_name = 'Metab Digest')" +
                    " AND metric_id = " + metric_id;
            await db.execute(sql).then(
                result => machine_data["pressure_metrics"][metric]["stats"]=JSON.parse(JSON.stringify(result))[0]
            ).catch(
                error => error_handle(error) 
            ); 
            

        }
        
        render();

    }

    function render(){
        //console.log(machine_data["components"][0]["lcms_metrics"]["Height (normalised)"]);
        var machine_details = {"machine_name": machine, 
                                "machine_type": machine_type, 
                                "experiment": experiment,
                                "display_metric": display_metric}
        machine_data["machine_details"] = machine_details;
        res.render('DEV-metabolomics', { ejs_machine_data: machine_data});
    }

    // handle errors from promises
    function error_handle(e){
        console.log(e.name + ": " + e.message);
    }
    
};