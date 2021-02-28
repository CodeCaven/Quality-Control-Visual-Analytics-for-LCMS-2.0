var async = require('async');
var db = require('../models/metabDB');

// Display HomePage.
exports.home = function(req, res) {
    
    const RUN_LIMIT = 10;
    let machines;
    let experiments = {};
    let machine_sql = "SELECT machine_name, machine_id, machine_type, use_metab, use_prot FROM machine";
    let exp_sql = "SELECT experiment_type, experiment_id FROM experiment";

    // execute promise for sql query
    let p1 = db.execute(machine_sql).then(
        result => machines = result
    ).catch(
        error => error_handle(error)
    );

    // execute promise for sql query
    let p2 = db.execute(exp_sql).then(
        result => create_exp_dict(result)
    ).catch(
        error => error_handle(error)
    );

    // wait for all the promises and call next function
    Promise.all([p1, p2]).then(
        result => get_machine_run_details()
    ).catch(
        error => error_handle(error)
    );

    // get last LIMIT run data
    async function get_machine_run_details(){

        for(let index in machines){
            // boolean to track if machine used for prot and metab
            let check = false;

            // get run details for metab
            if(machines[index].use_metab == "Y"){

                // check for dual experimet usage
                check = true;

                // get experiment and add to dict
                let exp = "metabolomics";
                machines[index]["experiment"] = exp;

                // get dates and summaries from DB
                let sql = "SELECT date_time, summary FROM qc_run WHERE completed = 'Y' AND " + 
                            "experiment_id = " + experiments[exp] + " AND machine_id = " + machines[index].machine_id + 
                            " ORDER BY date_time DESC LIMIT " + RUN_LIMIT;
                
                // execute query and wait for result
                await db.execute(sql).then(
                    result => add_run_details(result, index)
                ).catch(
                    error => error_handle(error)
                );
            }

            // get run details for prot
            if(machines[index].use_prot == "Y"){
                let exp = "proteomics";

                // a dual use machine, add new entry to dict
                if(check){
                    let new_machine = { machine_name: machines[index]["machine_name"],
                                        machine_id: machines[index]["machine_id"],
                                        machine_type: machines[index]["machine_type"],
                                        "experiment": exp}
                    machines.push(new_machine);
                }
                else{
                    machines[index]["experiment"] = exp;
                }

                // get dates and summaries from DB
                let sql = "SELECT date_time, summary FROM qc_run WHERE completed = 'Y' AND " + 
                            "experiment_id = " + experiments[exp] + " AND machine_id = " + machines[index].machine_id + 
                            " ORDER BY date_time DESC LIMIT " + RUN_LIMIT;

                
                // execute query and wait for result
                await db.execute(sql).then(
                    result => add_run_details(result, index)
                ).catch(
                    error => error_handle(error)
                );
            }
        }

        // sort client side ??
        //console.log(machines[0].summaries);
        // sort machines by experiment and machine name
        machines.sort((a, b) => (a.experiment > b.experiment) ? 1 : (a.experiment === b.experiment) ? 
        ((a.machine_name > b.machine_name) ? 1 : -1) : -1 );

        // render to client
        res.render('DEV-index', { ejs_machines: machines}); 
        //res.send("To implement ...");
    }
    
    // handle errors from promises
    function error_handle(e){
        console.log(e.name + ": " + e.message);
    }

    // create experiment dict from query results
    function create_exp_dict(results){
        for(let result in results){
            experiments[results[result].experiment_type] = results[result].experiment_id;
        }
    }

    // add the run dates and summaries to machines dict
    function add_run_details(results, machine_index){
        let dates = [];
        let summaries = [];

        // use try/catch for setting insert index
        try{
            if(machines[machine_index]["dates"].length > 0){
                // a dual machine, set index to end of machines list
                insert_index = machines.length - 1;
            }
        }
        catch(TypeError){
                insert_index = machine_index;
        }

        // create arrays
        for(let result in results){
            dates.push(results[result]["date_time"])
            summaries.push(results[result]["summary"])
        }

        // add to dict
        machines[insert_index]["dates"] = dates;
        machines[insert_index]["summaries"] = summaries;
    }

};