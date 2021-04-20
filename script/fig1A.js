var height = 500,
	width = 500;
var radius = 3;
var margin = ({top: 50, right: 10, bottom: 30, left: 50});

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

	// Add lines of best fit
	var curve = d3.line()
		.curve(d3.curveBasis);

	var blackPoints = [];
	var whitePoints = [];
	for (var i=0; i<d.length; i++){
		var t = [x(d[i].risk_score_quantile), y(d[i].num_chronic_conds_mean)];
		(i % 2 == 0) ? blackPoints.push(t) : whitePoints.push(t);
	}
   	svg.append('path')
   		.attr('d', curve(blackPoints))
   		.attr('stroke', 'purple')
   		.attr('fill', 'none');
	svg.append('path')
   		.attr('d', curve(whitePoints))
   		.attr('stroke', 'orange')
   		.attr('fill', 'none');
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
	var cutoffLines = [55, 97];
	svg.append('g')
		.selectAll('line')
		.data(cutoffLines)
		.join('line')
			.attr('x1', d => x(d))
			.attr('x2', d => x(d))
			.attr('y1', d => y(0))
			.attr('y2', 20)
			.attr('stroke', d => (d == 55) ? 'lightgrey' : 'black')
			.attr('stroke-width', 2)
			.attr('stroke-dasharray', d => (d == 55) ? 5 : 0);

	// Add percentile cutoff lines' labels
	svg.append('text')
		.attr('transform', 'translate('+x(55)+', 50)')
		.attr('text-anchor', 'end')
		.attr('fill', 'lightgrey')
		.text('Referred for screen');
	svg.append('text')
		.attr('transform', 'translate('+x(95)+', 50)')
		.attr('text-anchor', 'end')
		.text('Defaulted into program');

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
	svg.append('g')
		//.attr('transform', 'translate(' + margin.left + ','+ margin.top+')')
		.selectAll('circle')
			.data(d)
			.join('circle')
			.attr('id', (d,i)=>{ return i+'circle'; })
			.attr('cx', d => x(+d.risk_score_quantile))
			.attr('cy', d => y(+d.num_chronic_conds_mean))
			.attr('r', radius)
			.attr('fill', d => (d.race == 'black') ? '#764885' : '#ffa600')
			.attr('stroke', d => (d.race == 'black') ? '#764885' : '#ffa600');


	// Vertical slider
	var dragVert = d3.drag()
			.on('start', dragstarted)
			.on('drag', draggedVert)
			.on('end', dragend);

	var dragVertSlider = svg.append('rect')
			.attr('class', 'vertSlider')
			.attr('id', 'vertSliderBar')
			.attr('x', x(95))
			.attr('y', y(5.3))
			.attr('rx', 5)
			.attr('height', 460)
			.attr('width', 10)
			.attr('fill', 'lightsteelblue')
			.attr('opacity', 0.7)
			.attr('cursor', 'pointer')
		svg.append('rect')
			.attr('class', 'vertSlider')
			.attr('id', 'vertSliderHandle')
			.attr('x', x(95)-2)
			.attr('y', y(2.5)-25)
			.attr('rx', 8)
			.attr('height', 50)
			.attr('width', 14)
			.attr('fill', 'lightsteelblue')
			.attr('cursor', 'pointer')
			.call(dragVert);

	var toolTipG = svg.append('g')

	var toolTip = toolTipG.append('rect')
			.attr('id', 'tooltip')
			.attr('height', 120)
			.attr('width', 150)
			.attr('x', 100) //(event.x - 170)
			.attr('y', 100) //(500 - event.x)
			.attr('visibility', 'hidden')
			.attr('fill', 'lightsteelblue')
			.attr('rx', 5)
			.attr('opacity', '0.8');

	var toolTipText = toolTipG.append('text')
			.attr('id', 'tooltiptext')
			.attr('x', 110) //(event.x - 170)
			.attr('y', 110) //(500 - event.x)
			.attr('visibility', 'hidden')
			.attr('font-size', 12)
			.text('Move the vertical or horizontal bars.');
			


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
			.attr('height', 10)
			.attr('width', 450)
			.attr('fill', 'lightsteelblue')
			.attr('opacity', 0.7)
			.attr('cursor', 'pointer');
		svg.append('rect')
			.attr('class', 'horizSlider')
			.attr('id', 'horizSliderHandle')
			.attr('x', x(50)-25)
			.attr('y', y(1.4)-2)
			.attr('rx', 8)
			.attr('height', 14)
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
		d3.select("#" + whichSlider + "Bar").attr('x', event.x);
		d3.select("#" + whichSlider + "Handle").attr('x', event.x-2);
		const circles = d3.selectAll('circle').nodes();
		var circleIds = [];
		circles.forEach(element => {
			curr_x = element.cx.baseVal.value;
			if ((curr_x >= event.x-13) && (curr_x <= (event.x+13))) {
				element.setAttribute('r', radius * 2);
				curr_id = parseInt(element.id.split('circle')[0]);
				circleIds.push(curr_id);
			}
			else {
				element.setAttribute('r', radius);
			}
		});
		
	}
	function draggedHoriz(event,d){
		var whichSlider = d3.select(this).attr('class');
		d3.select("#" + whichSlider + "Bar").attr('y', event.y);
		d3.select("#" + whichSlider + "Handle").attr('y', event.y-2);
		const circles = d3.selectAll('circle').nodes();
		var circleIds = [];
		circles.forEach(element => {
			curr_y = element.cy.baseVal.value;
			if ((curr_y >= event.y-13) && (curr_y <= (event.y+13))) {
				element.setAttribute('r', radius * 2);
				curr_id = parseInt(element.id.split('circle')[0]);
				circleIds.push(curr_id);
			}
			else {
				element.setAttribute('r', radius);
			}
		});
		const labels = d3.selectAll('.labels').nodes();
		labels.forEach(element => {
			
			curr_id = parseInt(element.id.split('label')[0]);
			if (circleIds.includes(curr_id)) {				
				element.setAttribute('opacity', 1);
			}
			else {
				element.setAttribute('opacity', 0);
			}
		});
		
	}
	function dragend(event, d){
		var whichSlider = "." + d3.select(this).attr('class');
		d3.selectAll(whichSlider).raise().attr('fill', 'lightsteelblue');
		toolTipAppear(event, d);
	}

	function toolTipAppear(event, d){
		
		var t = d3.select("#tooltip")
			.transition(1)
			.attr('visibility', 'inline');
		var tText = d3.select('#tooltiptext')
			.transition(1)
			.attr('visibility', 'inline');

	}



})
.catch(function(error){
	console.log("Error on csv load");
	console.log(error)
})










