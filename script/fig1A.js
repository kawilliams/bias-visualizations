var height = 500,
	width = 500;
var radius = 3;
var margin = ({top: 50, right: 10, bottom: 30, left: 50});
var slider = {handle: 8, bar: 4};

// Load the data and run the graph
// Data: race, risk_score_quantile, num_chronic_conds_mean, ci
d3.csv("data/figure1a_replicate_request.csv").then(function(d){

	// x: Percentile of Algorithm Risk Score
	var x = d3.scaleLinear()
		.domain([0, 100])
		.range([margin.left, width-margin.right]);

	var xAxis = g => g
		.attr('transform', 'translate(0, ' + (height - margin.bottom) + ' )')
		.attr('class', 'xAxis')
		.call(d3.axisBottom(x).ticks(10))
		//.call(g => g.select(".domain").remove()) //removes the bottom axis
		.call(g => g.selectAll(".tick line").clone()
			.attr("y2", -height+margin.top)
			.attr("stroke", "black")
			.attr("stroke-opacity", 0.1))
		.call(g => g.append("text")
			.attr("x", width - 4)
			.attr("y", -4)
			.attr("font-weight", "bold")
			.attr("text-anchor", "end")
			.attr("fill", "black")
			.text(d.x));

	// // y: Number of active chronic conditions
	var y = d3.scaleLinear()
		.domain([0, Math.ceil(d3.max(d, function(d){ return d.num_chronic_conds_mean; }))])
		.range([height - margin.bottom, margin.top]);

	var yAxis = g => g
		.attr('transform', 'translate('+ margin.left + ',0)')
		.attr('class', 'yAxis')
		.call(d3.axisLeft(y).ticks(null,".1f"))
		//.call(g => g.select(".domain").remove()) //removes the left axis
		.call(g => g.selectAll(".tick line").clone()
			.attr("x2", width)
			.attr("stroke", "black")
			.attr("stroke-opacity", 0.1))
   		.call(g => g.select(".tick text").clone()
        	.attr("x", 4)
	        .attr("text-anchor", "start")
	        .attr("font-weight", "bold")
	        .attr("fill", "black")
        .text(d.y));


	var svg = d3.select('#fig1A')
	.attr('height', height)
	.attr('width', width);

	// Add rect to show shading past the 55%ile threshold
	svg.append('rect')
		.attr('x', x(55))
		.attr('y', y(5.5))
		.attr('width', x(100) - x(55) + 10)
		.attr('height', height - margin.top + 12)
		.attr('fill', 'lightgrey')
		.attr('opacity', 0.6);

	// Add lines of best fit
	// var curve = d3.line()
	// 	.curve(d3.curveBasis);

	var blackPoints = [];
	var whitePoints = [];
	for (var i=0; i<d.length; i++){
		var t = [d[i].risk_score_quantile, d[i].num_chronic_conds_mean];
		(i % 2 == 0) ? blackPoints.push(t) : whitePoints.push(t);
	}

	var exponentialRegression = d3.regressionExp()
			.x(d => d[0])
			.y(d => d[1])
			.domain([0, 100]);
	var blackCurve = exponentialRegression(blackPoints);
	var whiteCurve = exponentialRegression(whitePoints);

	var lineGenerator = d3.line()
		.x(d => x(d[0]))
		.y(d => y(d[1]));

	// purple/Black line of best fit
	svg.append("path")
		.data(blackCurve)
		.attr("d", lineGenerator(blackCurve))
		.style("stroke", "purple")
		.style("fill", "none")
		.style('stroke-width', "1px")
		.style('stroke-dasharray', '5')
	
 	// orange/White line of best fit
	svg.append("path")
		.data(whiteCurve)
		.attr("d", lineGenerator(whiteCurve))
		.style("stroke", "orange")
		.style("fill", "none")
		.style('stroke-width', "1px")
		.style('stroke-dasharray', '0')

	svg.append('g')
		.attr('id', 'xAxisGroup')
		.call(xAxis);

	//xAxis label
	d3.select('#xAxisGroup')
		.append('text')
		.attr('id', 'xAxisLabel')
		.attr('x', 270)
		.attr('y', 30)
		.attr('fill', 'black')
		.text('Percentile of Algorithm Risk Score');

	svg.append('g')
		.attr('id', 'yAxisGroup')
		.call(yAxis);
	//yAxis label
	d3.select('#yAxisGroup')
		.append('text')
		.attr('id', 'yAxisLabel')
		.attr('transform', 'rotate(-90)')
		.attr('x', -180)
		.attr('y', -30)
		.attr('fill', 'black')
		.text('Number of Active Chronic Conditions');


	// Add percentile lines marking "defaulted" (97%) and "referred" (55%)
	var cutoffLines = [{percentile: 55, text: 'Referred for screen'},
						{percentile: 97, text: 'Defaulted into program'}];
	svg.append('g')
		.selectAll('line')
		.data(cutoffLines)
		.join('line')
			.attr('x1', d => x(d.percentile))
			.attr('x2', d => x(d.percentile))
			.attr('y1', d => y(0))
			.attr('y2', 20)
			.attr('stroke', d => 'black')
			.attr('stroke-width', 2)
			.attr('stroke-dasharray', 5);

	// Add percentile cutoff lines' labels
	svg.append('g')
		.selectAll('text')
		.data(cutoffLines)
		.enter()
		.append('text')
			.attr('transform', d => 'translate('+(x(d.percentile)-3)+', 50)')
			.attr('fill', d => 'black')
			.text(d => d.text)
			.attr('text-anchor', 'end');
		
	// Add legend (Black: purple, White; orange)
	var legendColors = [{color: "orange" , path: "M60,55 l45,0" , 
						dasharray: "0", race: "White"},
						{color: "purple" , path: "M60,70 l50,0" , 
						dasharray: "5 5", race: "Black"}];
	// Add legend 
	svg.append('g')
		.selectAll('path')
		.data(legendColors)
		.join('path')
		.attr('d', d => d.path)
		.attr('stroke', d => d.color)
		.attr('stroke-dasharray', d => d.dasharray)
		.attr('stroke-width', 2)
		.attr('fill', 'none');
	svg.append('g')
		.selectAll('text')
		.data(legendColors)
		.enter()
		.append('text')
		.attr('x', 110)
		.attr('y', d => (d.race == 'Black') ? 72 : 57)
		.text(d => d.race);

	// Add confidence intervals at dots
	var confInterval = svg.append('g')
		.selectAll('g')
		.data(d)
		.join('g');

	confInterval.append('line')
		.attr('class', 'ci')
		.attr('id', (d,i)=> {
			return i+"ci";
		})
		.attr('x1', d => x(d.risk_score_quantile))
		.attr('y1', d => {
			d.ci = +d.ci;
			d.num_chronic_conds_mean = +d.num_chronic_conds_mean;
			return y(d.num_chronic_conds_mean + d.ci)
		})
		.attr('x2', d => x(d.risk_score_quantile))
		.attr('y2', d => y(d.num_chronic_conds_mean - d.ci))
		.attr('stroke', 'black')
		.attr('stroke-width', 1);

	//Add data points
	var dataCircles = svg.append('g')
		.selectAll('circle')
			.data(d)
			.join('circle')
			.attr('id', (d,i)=>{ return "circle"+i; })
			.attr('cx', d => x(+d.risk_score_quantile))
			.attr('cy', d => y(+d.num_chronic_conds_mean))
			.attr('r', radius)
			.attr('fill', d => (d.race == 'Black') ? '#764885' : '#ffa600')
			.attr('stroke', d => (d.race == 'Black') ? '#764885' : '#ffa600');

	var allLabelsG = svg.append('g');
	var label = allLabelsG.selectAll('rect')
		.data(d)
		.enter()
		.append('rect')
		.attr('class', d =>  "labels label"+d.id)
		.attr('width', 80)
		.attr('height', 40)
		.attr('fill', 'lightgrey')
		.attr('rx', 2)
		.attr('display', 'none')
		.attr('transform', d => 'translate(' + x(d.risk_score_quantile) + ',' + y(d.num_chronic_conds_mean) + ')');

	var labelText = allLabelsG.selectAll('text')
		.data(d)
		.enter()
		.append('text')
		.attr('class', d =>  "labels label"+d.id)
		.attr('display', 'none')
		.attr('transform', d => 'translate(' + x(d.risk_score_quantile) + ',' + y(d.num_chronic_conds_mean) + ')');


		labelText.selectAll('tspan')
		.data(d => [d.num_chronic_conds_mean, d.risk_score_quantile, d.race])
		.enter()
		.append('tspan')
		.attr('class', function(d){
			return this.parentElement.className.baseVal;
		})
		.text(function(d){
			if (d == "Black" | d == "White") {
				return "Race: " + d;
			}
			if (+d >= 10) {
				return "Percentile: " + d;
			}
			if (d < 5) {
				return "Conditions: " + d.toFixed(2);
			}
			return d;
		})
		.attr('display', 'none')
		.attr('x', 2)
		.attr('dy', '1.2em'); // (d,i) => i * 7 + 5);

	
		// .each(function(d){
		// 	console.log(d);
		// 	const p = d3.select(this);
		// 	switch(d.orient) {
		// 		case "top": p.attr('dx', '-0.5em').attr('dy', '0.32em').attr('text-anchor','start');break;
		// 		case "right": p.attr('dx', '0.5em').attr('dy', '0.32em').attr('text-anchor','start');break;
		// 		case "bottom": p.attr('dx', '0.5em').attr('dy', '0.7em').attr('text-anchor','start');break;
		// 		case "left": p.attr('dx', '-0.5em').attr('dy', '-0.22em').attr('text-anchor','end');break;	
		// 	}
		// });

	dataCircles
		.on('mouseover', showDotToolTip)
		.on('mouseout', hideDotToolTip);

	// Vertical slider
	var dragVert = d3.drag()
			.on('start', dragstarted)
			.on('drag', draggedVert)
			.on('end', dragend);

	var dragVertSlider = svg.append('rect')
			.attr('class', 'vertSlider')
			.attr('id', 'vertSliderBar')
			.attr('x', x(82))
			.attr('y', y(5.3))
			.attr('rx', 5)
			.attr('height', 460)
			.attr('width', slider.bar)
			.attr('fill', 'lightsteelblue')
			.attr('opacity', 0.7)
			.attr('cursor', 'pointer');
		var circleVertIds = [];
		svg.append('rect')
			.attr('class', 'vertSlider')
			.attr('id', 'vertSliderHandle')
			.attr('x', x(82)-2)
			.attr('y', y(2.5)-25)
			.attr('rx', 8)
			.attr('height', 50)
			.attr('width', slider.handle)
			.attr('fill', 'lightsteelblue')
			.attr('cursor', 'pointer')
			.call(dragVert);

	var toolTipG = svg.append('g')

	var toolTip = toolTipG.append('rect')
			.attr('id', 'tooltip')
			.attr('height', 120)
			.attr('width', 260)
			.attr('x', 100) //(event.x - 170)
			.attr('y', 100) //(500 - event.x)
			.attr('fill', 'lightsteelblue')
			.attr('rx', 5)
			.attr('opacity', '0.8');

	var toolTipText = { instructions: "Health providers used an algorithm\n\
										to determine which patients would get accepted into \n\
										an extra care program. The x-axis shows how a patient's\n\
										health score compared to others, and the y-axis shows \n\
										how healthy the patient is, based on number of chronic\n\
										conditions. Move the sliders to explore.",
				horizText: "These two patients are equally sick\n\
				(X conditions), but only the White \n\
				patient was chosen for screening.",
				vertText: "Both patients received the same \n\
						   health score from the algorithm \n\
						   (X percentile); however, the Black \n\
						   patient has more chronic conditions, \n\
						   like diabetes and heart disease, \n\
						   than the White patient (Y, \n\
						    compared to Z, respectively)."
				};
	var toolTipTextElement = toolTipG.selectAll('text')
			.data(d => toolTipText.instructions.split("\n"))
			.enter()
			.append("text")
			.attr('class', 'tiptext')
			.attr('x', 105) //(event.x - 170)
			.attr('y', 110) //(500 - event.x)
			.attr('font-size', 12);
		toolTipTextElement
			.append('tspan')
			.attr('class', 'tiptext')
			.text(d => d)
			.attr('x',105)
			.attr('y', (d,i) => i * 15 + 120);
			

	// Horizontal slider
	var dragHoriz = d3.drag()
			.on('start', dragstarted)
			.on('drag', draggedHoriz)
			.on('end', dragend);

	var dragHorizSlider = svg.append('rect')
			.attr('class', 'horizSlider')
			.attr('id', 'horizSliderBar')
			.attr('x', x(-1.5))
			.attr('y', y(1.4))
			.attr('rx', 5)
			.attr('height', slider.bar)
			.attr('width', 450)
			.attr('fill', 'lightsteelblue')
			.attr('opacity', 0.7)
			.attr('cursor', 'pointer');
	var circleHorizIds = [];
	svg.append('rect')
			.attr('class', 'horizSlider')
			.attr('id', 'horizSliderHandle')
			.attr('x', x(50)-25)
			.attr('y', y(1.4)-2)
			.attr('rx', 8)
			.attr('height', slider.handle)
			.attr('width', 50)
			.attr('fill', 'lightsteelblue')
			.attr('cursor', 'pointer')
			.call(dragHoriz);

	function dragstarted(event){
		var whichSlider = "." + d3.select(this).attr('class');
		d3.selectAll(whichSlider).raise().attr('fill', 'steelblue');
	}
	function draggedVert(event,d){
		var whichSlider = d3.select(this).attr('class');
		if (event.x < margin.left){
			d3.select("#" + whichSlider + "Bar").attr('x', margin.left);
			d3.select("#" + whichSlider + "Handle").attr('x', margin.left-2);	
		} else if (event.x > width-margin.right) {
			d3.select("#" + whichSlider + "Bar").attr('x', width-margin.right);
			d3.select("#" + whichSlider + "Handle").attr('x', width-margin.right-2);
		} else{
			d3.select("#" + whichSlider + "Bar").attr('x', event.x);
			d3.select("#" + whichSlider + "Handle").attr('x', event.x-2);
		}
		const circles = d3.selectAll('circle').nodes();

		circles.forEach(element => {
			curr_x = element.cx.baseVal.value;
			if ((curr_x >= event.x-radius) && (curr_x <= (event.x+radius+slider.bar))) {
				element.setAttribute('r', radius * 2);
			}
			else {
				element.setAttribute('r', radius);
			}
		});
		
	}
	function draggedHoriz(event,d){
		var whichSlider = d3.select(this).attr('class');
		
		//Prevent slider from going off the bottom
		if (event.y > (height - margin.bottom)) {
			d3.select("#" + whichSlider + "Bar").attr('y', height-margin.bottom);
			d3.select("#" + whichSlider + "Handle").attr('y', height-margin.bottom-2);
		} 
		//Prevent slider from going off the top
		else if (event.y < margin.top){
			d3.select("#" + whichSlider + "Bar").attr('y', margin.top);
			d3.select("#" + whichSlider + "Handle").attr('y', margin.top-2);
		}
		else {		
			d3.select("#" + whichSlider + "Bar").attr('y', event.y);
			d3.select("#" + whichSlider + "Handle").attr('y', event.y-2);
		}
		const circles = d3.selectAll('circle').nodes();
		circles.forEach(element => {
			curr_y = element.cy.baseVal.value;
			if ((curr_y >= (event.y-radius)) && (curr_y <= (event.y+radius+slider.bar))) {
				element.setAttribute('r', radius * 2);
			}
			else {
				element.setAttribute('r', radius);
			}
		});

		
	}
	function dragend(event, d){
		var whichSlider = "." + d3.select(this).attr('class');
		d3.selectAll(whichSlider).raise().attr('fill', 'lightsteelblue');

		const circles = d3.selectAll('circle').nodes();
		var circleDataArray = [];
		circles.forEach(element => {
			curr_y = element.cy.baseVal.value;
			curr_x = element.cx.baseVal.value;
			if ((whichSlider.includes('horiz')) && 
				(curr_y >= (event.y-radius)) && (curr_y <= (event.y+radius+slider.bar))) {
				var circleData = d3.select(element).datum();
				circleDataArray.push(circleData);
			}
			else if ((whichSlider.includes('vert')) && 
				(curr_x >= event.x-radius) && (curr_x <= (event.x+radius+slider.bar))){
				var circleData = d3.select(element).datum();
				circleDataArray.push(circleData);
			}
		});

		toolTipAppear(event, d, whichSlider, circleDataArray);
	}

	function toolTipAppear(event, d, whichSlider, selectedCircles){
		var text = whichSlider.includes("horiz") ? toolTipText.horizText : toolTipText.vertText;

		toolTipG.selectAll('text').remove();
	
		//Get the selected circles' data
		if (selectedCircles.length == 2 && whichSlider.includes("horiz")) {
			var X = selectedCircles[1].num_chronic_conds_mean.toFixed(2);
			var Y = selectedCircles[1].risk_score_quantile - selectedCircles[0].risk_score_quantile;
			text = text.replace("X", X);
			text = text.replace("Y", Y);
		} 
		else if (whichSlider.includes("horiz")){
			//Need to use a LoBF point
			var blackApproxY = 0;
			var blackApproxIndex = -1;
			blackCurve.forEach((element,i) => {
				if (y(element[1]) > event.y) {
					blackApproxY = y(element[1]);
					blackApproxIndex = i;
				}
			});
			var whiteApproxY = 0;
			var whiteApproxIndex = -1;
			whiteCurve.forEach((element,i) => {
				if (y(element[1]) > event.y) {
					whiteApproxY = y(element[1]);
					whiteApproxIndex = i;
				}
			});
			var X = blackCurve[blackApproxIndex][1].toFixed(2);
			// var Y = whiteCurve[whiteApproxIndex][0].toFixed(0);
			// var Z = blackCurve[blackApproxIndex][0].toFixed(0);
			text = text.replace("X", X);
		}
		if (selectedCircles.length == 2 && whichSlider.includes("vert")){
			var X = selectedCircles[1].risk_score_quantile;
			var Y = selectedCircles[0].num_chronic_conds_mean.toFixed(2);
			var Z = selectedCircles[1].num_chronic_conds_mean.toFixed(2);
			text = text.replace("X", X);
			text = text.replace("Y", Y);
			text = text.replace("Z", Z);
		}
		else if (whichSlider.includes("vert")){
			//Need to use a LoBF point
			var blackApproxX = 0;
			var blackApproxIndex = -1;
			blackCurve.forEach((element,i) => {
				if (x(element[0]) < event.x) {
					blackApproxX = x(element[0]);
					blackApproxIndex = i;
				}
			});
			var whiteApproxX = 0;
			var whiteApproxIndex = -1;
			whiteCurve.forEach((element,i) => {
				if (x(element[0]) < event.x) {
					whiteApproxX = x(element[0]);
					whiteApproxIndex = i;
				}
			});
			var X = blackCurve[blackApproxIndex][0].toFixed(0);
			var Y = whiteCurve[whiteApproxIndex][1].toFixed(2);
			var Z = blackCurve[blackApproxIndex][1].toFixed(2);
			text = text.replace("X", X);
			text = text.replace("Y", Y);
			text = text.replace("Z", Z);
		}


		var toolTipTextElement = toolTipG.selectAll('text')
				.data(d => text.split("\n"))
				.enter()
				.append("text")
				.attr('class', 'tiptext')
				.attr('x', 105) //(event.x - 170)
				.attr('y', 110) //(500 - event.x)
				.attr('font-size', 12);
			toolTipTextElement
				.append('tspan')
				.attr('class', 'tiptext')
				.text(d => d)
				.attr('x',105)
				.attr('y', (d,i) => i * 15 + 120);
	}

	function showDotToolTip(event, d) {
		var whichLabel = "label" + d3.select(this).attr('id').split('circle')[1];
		
		var allPartsOfDotToolTip = document.getElementsByClassName(whichLabel);

		for (var i = 0; i<allPartsOfDotToolTip.length; i++) {
			allPartsOfDotToolTip[i].setAttribute("display", "inline");
		}
	}
	function hideDotToolTip(event, d) {
		d3.selectAll('.labels').attr('display', 'none');
	}


})
.catch(function(error){
	console.log("Error on csv load");
	console.log(error)
})










