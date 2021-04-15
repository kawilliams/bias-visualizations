var height = 500,
	width = 500;
var radius = 3;
var margin = ({top: 50, right: 10, bottom: 30, left: 50});

//Load the data and run the graph
d3.csv("script/dummy-data.csv").then(function(d){

	// x: Percentile of Algorithm Risk Score
	var x = d3.scaleLinear()
		.domain([0, 100])
		.range([margin.left, width-margin.right]);

	var xAxis = g => g
		.attr('transform', 'translate(0, ' + (height - margin.bottom) + ' )')
		.attr('class', 'xAxis')
		.call(d3.axisBottom(x).ticks(width/80))
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
		.domain([0, Math.ceil(d3.max(d, function(d){ return d.score; }))])
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

	svg.append('g')
		.call(xAxis);

	svg.append('g')
		.call(yAxis);

	// Add percentile lines marking "defaulted" (95%) and "referred" (55%)
	var cutoffLines = [55, 95];
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
			.attr('stroke-dasharray', 8);

	// Add percentile cutoff lines' labels
	svg.append('text')
		.attr('transform', 'translate('+x(55)+', 50)')
		.attr('text-anchor', 'end')
		.attr('font-family', 'sans-serif')
		.attr('font-size', 10)
		.attr('fill', 'lightgrey')
		.text('Referred for screen');
	svg.append('text')
		.attr('transform', 'translate('+x(95)+', 50)')
		.attr('text-anchor', 'end')
		.attr('font-family', 'sans-serif')
		.attr('font-size', 10)
		.text('Defaulted into program');

	//Add data points
	svg.append('g')
		//.attr('transform', 'translate(' + margin.left + ','+ margin.top+')')
		.selectAll('circle')
			.data(d)
			.join('circle')
			.attr('id', (d,i)=>{ return i+'circle'; })
			.attr('cx', d => x(d.percentile))
			.attr('cy', d => y(d.score))
			.attr('r', radius)
			.attr('fill', d => (d.race == 'B') ? 'purple' : 'orange')
			.attr('stroke', d => (d.race == 'B') ? 'purple' : 'orange')
			.append('text');

	var label = svg.append('g')
		.attr('font-family', 'sans-serif')
		.attr('font-size', 10)
		.selectAll('g')
		.data(d)
		.join('g')
		.attr('transform', d => 'translate(' + x(d.percentile) + ',' + y(d.score) + ')')
		.attr('opacity', 1);
	label.append('text')
		.attr('class', 'labels')
		.attr('id', (d,i)=> {
			return i+"label";
		})
		.text(d => d.score + " " + d.race)
		.each(function(d){
			const p = d3.select(this);
			switch(d.orient) {
				case "top": p.attr('text-anchor', 'middle').attr('dy', '-0.7em');break;
				case "right": p.attr('dx', '0.5em').attr('dy', '0.32em').attr('text-anchor','start');break;
				case "bottom": p.attr('text-anchor', 'middle').attr('dy','1.4em');break;
				case "left": p.attr('dx', '-0.5em').attr('dy', '0.32em').attr('text-anchor','end');break;	
			}
		});

	// Vertical slider
	var dragVert = d3.drag()
			.on('start', dragstarted)
			.on('drag', draggedVert)
			.on('end', dragend);

	var dragVertSlider = svg.append('rect')
			.attr('x', x(80))
			.attr('y', y(5))
			.attr('height', 420)
			.attr('width', 5)
			.attr('fill', 'lightsteelblue')
			.attr('opacity', 0.7)
			.attr('cursor', 'pointer')
			.call(dragVert);

	// Horizontal slider
	var dragHoriz = d3.drag()
			.on('start', dragstarted)
			.on('drag', draggedHoriz)
			.on('end', dragend);

	var dragHorizSlider = svg.append('rect')
			.attr('x', x(0))
			.attr('y', y(2))
			.attr('height', 5)
			.attr('width', 420)
			.attr('fill', 'lightsteelblue')
			.attr('opacity', 0.7)
			.attr('cursor', 'pointer')
			.call(dragHoriz);

	function dragstarted(event){
		d3.select(this).raise().attr('fill', 'steelblue');
	}
	function draggedVert(event,d){
		d3.select(this).attr('x', event.x);
		const circles = d3.selectAll('circle').nodes();
		var circleIds = [];
		circles.forEach(element => {
			curr_x = element.cx.baseVal.value;
			if ((curr_x >= event.x) && (curr_x <= (event.x+5))) {
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
			if (circleIds.includes(curr_id)) {				element.setAttribute('opacity', 1);
			}
			else {
				element.setAttribute('opacity', 0);
			}
		})
	}
	function draggedHoriz(event){
		d3.select(this).attr('y', event.y);
		const circles = d3.selectAll('circle').nodes();
		var circleIds = [];
		circles.forEach(element => {
			curr_y = element.cy.baseVal.value;
			if ((curr_y >= event.y) && (curr_y <= (event.y+5))) {
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
		})
	}
	function dragend(event, d){
		d3.select(this).attr('fill', 'lightsteelblue');
	}



})
.catch(function(error){
	console.log("Error on csv load");
	console.log(error)
})










