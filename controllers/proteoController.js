// Display ProteomicsPage.
var async = require('async');
var db = require('../models/metabDB');
let colormap = require('colormap');
const colorbrewer = require('colorbrewer');

// Display ProteomicsPage.
exports.proteo_home = function(req, res) {
		
		// REFACTOR: variable declarations (var, let or none), mixed as forcing scope while learning JS
		// sql and container for query results
		const limit = 90;
		var result_data = {};
		let m_sql = "SELECT display_order, display_name FROM metric WHERE display_order > 0 " + 
					"AND use_prot='Y'  AND metric_type='mzmine' ORDER BY display_order"; // limit morpheus
		let c_sql = "SELECT component_name FROM sample_component"  +
					" WHERE experiment_id = (SELECT experiment_id FROM experiment WHERE experiment_type = 'proteomics')" + 
					" AND component_name <> 'Hela Digest' ORDER BY component_name"; // limit hela digest
		let mac_sql = "SELECT machine_name FROM machine WHERE use_prot = 'Y'";
		let v_sql = "SELECT DISTINCT machine_venue FROM machine";

		// MORPHEUS
		let morph_m_sql = "SELECT display_order, display_name FROM metric WHERE display_order > 0 " + 
					"AND use_prot='Y'  AND metric_type='morpheus' ORDER BY display_order"; 
		
		// execute query as a promise
		let p1 = db.execute(m_sql).then(
		  result => result_data["metrics"] = result, 
		  error => console.log(error) 
		  // put errors in catch (all promises)
		  // define an error function to handle this in REFACTOR
		);

		// execute query as a promise
		let p2 = db.execute(v_sql).then(
			result => result_data["venues"] = result, 
			error => console.log(error) 
			// put errors in catch (all promises)
		  );
		
		// execute query as a promise
		let p3 = db.execute(mac_sql).then(
			result => result_data["machines"] = result, 
			error => console.log(error) 
			// put errors in catch (all promises)
		);

		// execute query as a promise
		let p4 = db.execute(morph_m_sql).then(
			result => result_data["morph"] = result, 
			error => console.log(error) 
			// put errors in catch (all promises)
		);
		
		// execute query as a promise
		let p5 = db.execute(c_sql).then(
			result => result_data["components"] = result,
		    error => console.log(error) 
		);
		
		// wait for all the promises
		Promise.all([p1, p2, p3, p4, p5]).then(
			result => get_measurements(),
			error => console.log(error)
		);
		
		
		// converts mysql return objects to lists for view
		function convert_to_list(table){
			results = [];
			let data = result_data[table];
			
			let lookup = {
				"metrics": "display_name",
				"machines": "machine_name",
				"components": "component_name",
				"venues": "machine_venue",
				"morph": "display_name"
			};
			
			if (lookup.hasOwnProperty(table) == false) {
				console.log('No table');
				return results;
			}
			
			for(var key in data){
				results.push(data[key][lookup[table]].trim());
			}
			//console.log(results);
		
			return results;
		}

		function create_html_tooltip(date, component, value, chart_type){

			if(value == "NO DATA"){
				return '<div style="padding:5px 5px 5px 5px;">' +
							'<strong>' + date.toString().slice(0,25) + '</strong>' + '</br>' +
							'<strong>' + component + '</strong>' + ':' + '</br>' + value +
							'</div>';
			}


			if(chart_type == 'F'){	
				return '<div style="padding:5px 5px 5px 5px;">' +
							'<strong>' + date.toString().slice(0,25) + '</strong>' + '</br>' +
							'<strong>' + component + '</strong>' + ':' + '</br>' + parseFloat(value).toFixed(3).toString() +
							'</div>';
				
			}
			
			if(chart_type == 'I'){	
				return '<div style="padding:5px 5px 5px 5px;">' +
							'<strong>' + date.toString().slice(0,25) + '</strong>' + '</br>' +
							'<strong>' + component + '</strong>' + ':' + '</br>'+ parseInt(value).toString() +
							'</div>';
			}
			
		}

		function create_html_medians_tooltip(medians, metric){
			return '<div style="padding:5px 5px 5px 5px;">' +
					'<strong>' + metric + '</strong>' + '</br>' +
					'<strong>1st Median: </strong>' + parseFloat(medians['25_percent']).toFixed(3).toString() + '</br>' +
					'<strong>Median: </strong>' + parseFloat(medians['50_percent']).toFixed(3).toString() + '</br>' +
					'<strong>3rd Median: </strong>' + parseFloat(medians['75_percent']).toFixed(3).toString() + '</br>' +
					'</div>';
		}


		// creates an array with date, values, venue name, machine name and tooltips
		function create_date_data(p_data, mtype, date){
			//console.log("LINE DATA");
			//console.log(p_data);
			
			// if no data just return
			if(p_data.length == 0){
				//console.log(date); // for DEV
				return;
			}

			for(pkey in p_data){
				if (mtype == 'Mass Error (mDa)' || mtype == 'Mass Error (ppm)' || mtype == 'Height (normalised)' || mtype == 'Area (normalised)'){
					
					// check mDA -259022.44, -130087.35
					// normalised missed values are set to -100 in db
					if(p_data[pkey].value <= -100){
						date_data.push(null);
						date_data.push('color:' + component_colours[p_data[pkey].component_name]); // style column
						date_data.push(create_html_tooltip(date, p_data[pkey].component_name, "NO DATA", "F")); // tooltip column
						date_data.push(false); // uncertainty column
					}
					else{
						date_data.push(p_data[pkey].value);
						date_data.push('color:' + component_colours[p_data[pkey].component_name]); // style column
						date_data.push(create_html_tooltip(date, p_data[pkey].component_name, p_data[pkey].value, "F")); // tooltip column
						date_data.push(true); // uncertainty column
					}
					
				}else
					if(p_data[pkey].value == 0){
						date_data.push(null);
						date_data.push('color:' + component_colours[p_data[pkey].component_name]); // style column
						date_data.push(create_html_tooltip(date, p_data[pkey].component_name, "NO DATA", "F"));// tooltip columns
						date_data.push(false); // uncertainty column
					}
					else{
						date_data.push(p_data[pkey].value);
						date_data.push('color:' + component_colours[p_data[pkey].component_name]); // style column
						date_data.push(create_html_tooltip(date, p_data[pkey].component_name, p_data[pkey].value, "F")); // tooltip columns
						date_data.push(true); // uncertainty column
					}
			}
			
			date_data.push(p_data[0].machine_venue);
			date_data.push(p_data[0].machine_name);	

			// add intervals, change here to set for other metrics
			if(mtype == 'Mass Error (ppm)'){
				date_data.push(3);
				date_data.push(-3);
			}
			else if(mtype == 'Area (normalised)' ||mtype == 'Height (normalised)'){
				date_data.push(2);
				date_data.push(-2);
			}
			else{
				date_data.push(0);
				date_data.push(0);
			}	
			//console.log(date_data);
		}

		async function create_morph_date_data(p_data, mtype, date){
			
			// no data for date (won't need when upto date)
			if(p_data.length == 0){
				morph_date_data.pop();
				return;
			}

			// metric value with ann/uncert cols
			if(p_data[0].value == 0){
				morph_date_data.push(null);
				morph_date_data.push('color:blue'); // style
				morph_date_data.push(create_html_tooltip(date, p_data[0].component_name, "NO DATA", "I"));// tooltip columns
				morph_date_data.push(false); // uncertainty column
			}
			// for precursor mass error, -1 when no average from processing
			else if(p_data[0].value == -1){ 
				morph_date_data.push(null);
				morph_date_data.push('color:blue'); // style
				morph_date_data.push(create_html_tooltip(date, p_data[0].component_name, "NO DATA", "I"));// tooltip columns
				morph_date_data.push(false); // uncertainty column
			}
			else{
				morph_date_data.push(p_data[0].value);
				morph_date_data.push('color:blue'); //style
				if(mtype == 'Precursor Mass Error ppm (Morpheus)'){
					morph_date_data.push(create_html_tooltip(date, p_data[0].component_name, p_data[0].value, "F"));// tooltip columns
				}
				else{
					morph_date_data.push(create_html_tooltip(date, p_data[0].component_name, p_data[0].value, "I"));// tooltip columns
				}
				morph_date_data.push(true); // uncertainty column
			}

			// get median values, need to take nested out for VM(bind var. issue)
			var sql_morph_meds = "SELECT 25_percent, 50_percent, 75_percent FROM stat WHERE machine_id = (SELECT machine_id " +
					" FROM machine WHERE machine_name = '" + p_data[0].machine_name + " ') AND  metric_id = " +
					"(SELECT metric_id FROM metric WHERE display_name = '" + mtype + "' ) AND component_id = " +
					"(SELECT component_id FROM sample_component WHERE component_name = 'Hela Digest')";

			medians = {};
			await db.execute(sql_morph_meds).then(
				function(result){medians=result[0];}, 
				error => console.log(error) 
			);
			
			// add median and machine venue,name and 1st,3rd median intervals
			morph_date_data.push(medians['50_percent']); // no uncertainty ann as should always have a value
			morph_date_data.push('color:red'); // style
			morph_date_data.push(create_html_medians_tooltip(medians,mtype)); // tooltip
			morph_date_data.push(p_data[0].machine_venue);
			morph_date_data.push(p_data[0].machine_name);
			morph_date_data.push(medians['25_percent']);
			morph_date_data.push(medians['75_percent']);
		}


		// creates an array with box plot data
		function create_box_data(p_data, mtype){
			//console.log("BOX DATA");
			//console.log(p_data);
			// change here to remove min/max
			var medians = {'50_percent':p_data[0]['50_percent'], 
							'25_percent':p_data[0]['25_percent'],
							'75_percent':p_data[0]['75_percent']};
			new_box.push(p_data[0].component_name);
			new_box.push(p_data[0]['50_percent']);
			new_box.push(create_html_medians_tooltip(medians,mtype)); // tooltip
			new_box.push(p_data[0]['25_percent']);
			new_box.push(p_data[0]['75_percent']);
			new_box.push(p_data[0].machine_venue);
			new_box.push(p_data[0].machine_name);
			//console.log(new_box);
		}

		// test functions
		function check_line_data(){
			for(var key in line_data){
				var full_data = line_data[key];
				console.log(key);
				for(var index in full_data){
					console.log(full_data[index]);
				}
			}
		}

		function check_box_data(){
			for(var key in box_data){
				var full_data = box_data[key];
				console.log(key);
				for(var index in full_data){
					console.log(full_data[index]);
				}
			}
		}

		function check_morph_line_data(){
			for(var key in morph_data){
				var full_data = morph_data[key];
				console.log(key);
				for(var index in full_data){
					console.log(full_data[index]);
				}
			}
		}

		function create_table_colours(){
			
			let colors = colormap({
					colormap: 'RdBu',
					nshades: 17,
					format: 'hex',
					alpha: 1
				})
			return colors;
		}


		function create_menu(menu_data, loc){
			menu[loc] = [];
			for(item in menu_data){
				menu[loc].push(menu_data[item].machine_name);
			};
		}

		function create_component_colours(){
			// 11 colour blind friendly pallete www.colorbrewer2.org one for each component
			// https://www.npmjs.com/package/colorbrewer

			//console.log(colorbrewer.schemeGroups);
			var pallete = colorbrewer.Spectral[components.length];
			// remove hardcoded coours when settle on colour scheme
			pallete[1] = '#ff0000' // red;
			pallete[4] = '#FFC0CB'; // pink
			pallete[5] = '#000000'; // black
			pallete[6] = '#008800'; // green
			pallete[7] = '#ffd700'; // gold
			//var pallete = ['#a50026','#d73027','#f46d43','#fdae61','#fee090','#ffffbf','#e0f3f8','#abd9e9','#74add1','#4575b4','#31369'];
			for(let i = 0; i<components.length; i++){
				component_colours[components[i]] = pallete[i];
			}
		}


		// main function that performs the logic to create render data
		async function get_measurements(){
			
			metrics = convert_to_list('metrics');
			components = convert_to_list('components');
			machines = convert_to_list('machines');
			venues = convert_to_list('venues');
			morph_metrics = convert_to_list('morph');
			menu = {};
			component_colours = {};
			create_component_colours();
			
			
			// set up a dictionary for machine venues menu
			for(venue in venues){
				var new_loc = venues[venue];
				sql = "SELECT machine_name FROM machine WHERE machine_venue = '" + new_loc + "'" +
						" AND use_prot = 'Y'"
				await db.execute(sql).then(
					result =>create_menu(result, new_loc), 
					error => console.log(error) 
				  );
			}
			
			line_data = {};
			box_data = {};
			morph_data = {};

			// get line chart data
			for(var m_index in metrics){
				var dname = metrics[m_index];
				line_data[dname] = [];

				for(var mach in machines){
					
					// get machine id cos can't bind var in nested select
					var mname = machines[mach];
					let mach_sql = "SELECT machine_id FROM machine WHERE machine_name = " + "'" + mname + "'";
					
					
					await db.execute(mach_sql).then(
						function(result){
							mach_id = result[0].machine_id;
							}, 
						error => console.log(error) 
					);
					
					// get last 'limit' dates by machine
					let dates_sql = "SELECT  run_id,date_time FROM qc_run WHERE completed = " + "'Y'" + 
					" AND experiment_id = (SELECT experiment_id FROM experiment WHERE experiment_type = 'proteomics') " + 
					" AND machine_id = " + "'" + mach_id + "' ORDER BY date_time desc LIMIT " + limit;
					
					await db.execute(dates_sql).then(
						function(result){
							dates = result;
							}, 
						error => console.log(error) 
					);
					
					// reverse dates for Google charts slider order
					dates.reverse();
				
					for(var d_key in dates) {
						
						var rid = dates[d_key].run_id;
						var r_date = dates[d_key].date_time;
						r_date = new Date(r_date); // not working, arrives at server as string
						
						date_data = [r_date]; 
						
						// machine, run and component limited by experiment key which limits measurement
						// metric needs to be limited by use-prot and morpheus fields (and hela)...WATCH
						var sql = "SELECT r.value, c.component_name, t.machine_venue, t.machine_name "
						+ "FROM sample_component c, metric m, measurement r, qc_run q, machine t, experiment e "
						+ "WHERE r.run_id = q.run_id " 
						+ "AND r.metric_id = m.metric_id " 
						+ "AND r.component_id = c.component_id "
						+ "AND q.machine_id = t.machine_id "
						+ "AND m.display_name = " +  "'" + dname + "'"
						+ " AND q.run_id = " + "'" + rid + "'"
						+ " AND e.experiment_id = q.experiment_id " 
						+ " AND c.experiment_id = e.experiment_id " 
						+ " AND e.experiment_type = 'proteomics' "
						+ " AND m.use_prot = 'Y' "
						+ " AND m.metric_type = 'mzmine' " // limit to mzmine
						+ " AND c.component_name <> 'Hela Digest' " // limit hela
						+ " ORDER BY c.component_name";
						
						await db.execute(sql).then(
							result => create_date_data(result, dname, r_date), 
							error => console.log(error) 
						);
						
						// only keep date with data
						if(date_data.length > 1){
							line_data[dname].push(date_data);
						}
					}
				}
			}

			// get morpheus line chart data
			for(var m_index in morph_metrics){
				var dname = morph_metrics[m_index];
				morph_data[dname] = [];

				for(var mach in machines){
					
					// get machine id cos can't bind var in nested select
					var mname = machines[mach];
					let mach_sql = "SELECT machine_id FROM machine WHERE machine_name = " + "'" + mname + "'";
					
					
					await db.execute(mach_sql).then(
						function(result){
							mach_id = result[0].machine_id;
							}, 
						error => console.log(error) 
					);
					
					// get last 'limit' dates by machine
					let dates_sql = "SELECT  run_id,date_time FROM qc_run WHERE completed = " + "'Y'" + 
					" AND experiment_id = (SELECT experiment_id FROM experiment WHERE experiment_type = 'proteomics') " + 
					" AND machine_id = " + "'" + mach_id + "' ORDER BY date_time desc LIMIT " + limit;
					
					await db.execute(dates_sql).then(
						function(result){
							dates = result;
							}, 
						error => console.log(error) 
					);
					
					// reverse dates for Google charts slider order
					dates.reverse();
				
					for(var d_key in dates) {
						
						var rid = dates[d_key].run_id;
						var r_date = dates[d_key].date_time;
						r_date = new Date(r_date); // not working, arrives at server as string
						
						morph_date_data = [r_date]; 
						
						// machine, run and component limited by experiment key which limits measurement
						// metric needs to be limited by use-prot and morpheus fields (and hela)...WATCH
						var sql = "SELECT r.value, c.component_name, t.machine_venue, t.machine_name "
						+ "FROM sample_component c, metric m, measurement r, qc_run q, machine t, experiment e "
						+ "WHERE r.run_id = q.run_id " 
						+ "AND r.metric_id = m.metric_id " 
						+ "AND r.component_id = c.component_id "
						+ "AND q.machine_id = t.machine_id "
						+ "AND m.display_name = " +  "'" + dname + "'"
						+ " AND q.run_id = " + "'" + rid + "'"
						+ " AND e.experiment_id = q.experiment_id " 
						+ " AND c.experiment_id = e.experiment_id " 
						+ " AND e.experiment_type = 'proteomics' "
						+ " AND m.use_prot = 'Y' "
						+ " AND m.metric_type = 'morpheus' " ;
						
						await db.execute(sql).then(
							result => create_morph_date_data(result, dname, r_date), 
							error => console.log(error) 
						);
						
						// only keep data with a date, in DEV some runs may only have mzmine metrics
						if(morph_date_data.length > 0){
							morph_data[dname].push(morph_date_data);
						}
					}
				}
			}

			// get box chart data
			// gets a row at a time, could get mutiple rows and loop in handler
			for(var m_index in metrics){
				dname = metrics[m_index];

				// compare lengths to exclude normalised metrics..REFACTOR
					if(dname.length != 17 && dname.length != 19){
						box_data[dname] = [];
						for(var c_index in components){
							cname = components[c_index];
							for(var mac_index in machines){
								macname = machines[mac_index];
								new_box = [];
								
								var sql = "SELECT c.component_name,s.50_percent, s.min, s.25_percent, s.75_percent, s.max, t.machine_venue, t.machine_name "
								+ "FROM stat s, sample_component c, machine t, metric m "
								+ "WHERE s.metric_id = m.metric_id "
								+ "AND s.machine_id = t.machine_id "
								+ "AND s.component_id = c.component_id "
								+ "AND m.display_name = " +  "'" + dname + "' "
								+ "AND c.component_name = " +  "'" + cname + "' "
								+ "AND t.machine_name = " +  "'" + macname + "' ";
								
								await db.execute(sql).then(
									result => create_box_data(result, dname), 
									error => console.log(error) 
								);
								// dont think then is needed here as await handles it?
								box_data[dname].push(new_box);
								
							}
						}
						
					}
				
			}
			
					
			//check_line_data();
			//check_box_data();
			//check_morph_line_data();

			let table_colours = create_table_colours();
			//console.log(table_colours);
			res.render('proteomics', { title: 'PROTEOMICS',
								  change_title: 'Metabolomics',
								  v_table_colours : table_colours, 
								  v_metrics: metrics,
								  v_components: components,
								  v_data: line_data,
								  v_box_data: box_data,
								  v_venues: venues,
								  v_machines: machines,
								  v_morph_data: morph_data,
								  v_morph_metrics: morph_metrics,
								  v_component_colours: component_colours,
								  v_menu: menu});
			
		//res.send("To implement ...");	
		}
};