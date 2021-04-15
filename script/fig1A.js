var height = 500,
	width = 500;

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
		.domain(d3.extent(d, function(d){ return d.score; }))
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



})
.catch(function(error){
	console.log("Error on csv load");
	console.log(error)
})










