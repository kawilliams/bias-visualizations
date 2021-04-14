var height = 500,
	width = 500;

var margin = ({top: 20, right: 12, bottom: 30, left: 30});

//Load the data and run the graph
d3.csv("script/dummy-data.csv").then(function(d){
	// x: Percentile of Algorithm Risk Score
	var x = d3.scaleLinear()
		.domain([0, ])
		.range([height - margin.bottom, margin.top]);

	var xAxis = g => g
		.attr('transform', 'translate(0, ' + (height - margin.bottom) + ' )')
		.call(d3.axisBottom(d.x).ticks(width/80))
		.call(g => g.select(".domain").remove())
		.call(g => g.select(".tick line").clone()
			.attr("y2", -height)
			.attr("stroke-opacity", 0.1))
		.call(g => g.append("text")
			.attr("x", width - 4)
			.attr("y", -4)
			.attr("font-weight", "bold")
			.attr("text-anchor", "end")
			.attr("fill", "black")
			.text(d.x));

	// // y: Number of active chronic conditions



	var svg = d3.select('#fig1A');

	svg.append('g')
		.call(xAxis);








})
.catch(function(error){
	console.log("Error on csv load");
})










