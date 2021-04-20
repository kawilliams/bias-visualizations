
var margin = ({top: 50, right: 10, bottom: 30, left: 50});

var circleBox = 12;
var algBoxSize = {height: 30, width: 60};
var radius = 4;


d3.csv('data/patient-dot-data.csv').then(function(d){
	var svg = d3.select('div#container')
		.append('svg')
		.attr('preserveAspectRatio', 'xMidYMid meet')
		.attr('viewBox', "0 0 300 150")
		.classed('svg-content', true);
		// .append('g')
		// .attr('class', 'svgWrapper')
		// .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")");

	//Container for the gradients to make the glow
	var defs = svg.append('defs');

	var filter = defs.append("filter")
		.attr("id","glow");

	filter.append("feGaussianBlur")
		.attr("class", "blur")
		.attr("stdDeviation","4")
		.attr("result","coloredBlur");

	var feMerge = filter.append("feMerge");
	feMerge.append("feMergeNode")
		.attr("in","coloredBlur");
	feMerge.append("feMergeNode")
		.attr("in","SourceGraphic"); 

	var patients = svg.selectAll('g')
		.data(d)
		.join('g');

	patients.append('circle')
		.attr('class', 'dots exampleGlow')
		.attr('cx', d => d.x * circleBox + margin.left)
		.attr('cy', d => d.y * circleBox + margin.top )
		.attr('r', radius)
		.attr('fill', '#EDC951');

	patients.append('text')
		.attr('class', 'label')
		.attr('transform', d => {
			var x = d.x * circleBox + margin.left;
			var y = d.y * circleBox + margin.top;
			return "translate("+ x +","+ y +")";
		})
		.text(d => d.race)
		.attr('fill', d => d.race == 'B' ? 'black' : 'white')
		.attr('font-weight', d => d.race == 'B' ? 'bolder' : 'normal')
		.attr('font-size', '4px')
		.attr('opacity', 0);

	// Move the patients to the right side
	patients.attr('transform', 'translate(120,-8)');


	var algorithmG = svg.append('g');

	var algorithmBox = algorithmG
		.append('rect')
		.attr('class', 'alg')
		.attr('x', 90)
		.attr('y', 45)
		.attr('height', algBoxSize.height)
		.attr('width', algBoxSize.width)
		.attr('fill', 'lightgrey')
		.on('click', initialSickFilter)
		.attr('cursor', 'pointer');

	var algorithmText = algorithmG
		.append('text')
		.text('Algorithm')
		.attr('x', 95)
		.attr('y', 65)
		.on('click', initialSickFilter)
		.attr('cursor', 'pointer');

	var inputBoxG = svg.append('g');
	var inputBoxRect = inputBoxG.append('rect')
		.attr('x', 10)
		.attr('y', 10)
		.attr('height', 100)
		.attr('width', 50)
		.attr('fill', 'lightsteelblue');
	var inputBoxText = inputBoxG.append('text')
		.text('Insurance claims info')
		.attr('x', 10)
		.attr('y', 30);

	var nextBoxG = svg.append('g');
	var nextBox = nextBoxG.append('rect')
		.attr('class', 'next')
		.attr('x', 93)
		.attr('y', 115)
		.attr('height', 15)
		.attr('display', 'none')
		.on('click', showPopUp);
	var nextBoxText = nextBoxG.append('text')
		.attr('class', 'next')
		.text('NEXT')
		.attr('x', 97)
		.attr('y', 130)
		.attr('opacity', 0)
		.attr('cursor', 'pointer')
		.on('click', showPopUp);
		

	var popUpBoxG = svg.append('g');
	var popUpBox = popUpBoxG.append('rect')
		.attr('id', 'popupbox')
		.attr('class', 'popup')
		.attr('rx', 8)
		.attr('width', 3)
		.attr('height', 3)
		.attr('display', 'none')
		.on('click', closePopUp);

	popUpBoxG.append('text')
		.attr('id', 'popuptext')
		.attr('class', 'popup')
		.attr('x', 10)
		.attr('y', 10)
		.text("Let's check our algorithm")
		.attr('display', 'none');


	function initialSickFilter(d){
		d3.selectAll('.dots')
			.transition()
			.attr('fill', d => (d.x >= 2) ? '#84b046' : 'lightgrey'); //green
		// d3.selectAll(".exampleGlow")
		// 	.style('filter', 'url(#glow)');

		d3.select('rect.next')
			.transition()
			.attr('height', 25)
			.attr('width', 50)
			.attr('display', 'inline')
			.attr('fill', 'lightsteelblue');
		d3.select('text.next')
			.transition()
			.attr('opacity', 1);
	}
	function showPopUp() {
		d3.select('#popupbox')
			.transition()
			.attr('display','inline')
			.attr('x', 50)
			.attr('y', 30)
			.attr('fill', 'white')
			.attr('stroke', 'lightsteelblue')
			.attr('height', 100)
			.attr('width', 200)
			.attr('opacity', 0.9);
		d3.select('#popuptext')
			.transition()
			.attr('x', 60)
			.attr('y', 50)
			.attr("display", 'inline');

		d3.selectAll('.next')
			.transition()
			.attr('display', 'none');
	}

	function closePopUp() {
		d3.selectAll('.popup')
			.transition()
			.attr('display', 'none');
		recolorPatients();
	}

	function recolorPatients() {
		d3.selectAll('.dots')
		.transition()
		.attr('fill', d => (d.x > 0 && d.x < 4) ? '#84b046' : 'lightgrey');

		d3.selectAll('.label')
		.attr('opacity', 1);
	}
	// d3.selectAll('.alg')
	// 	.style('filter', 'url(#glow)');
		
}) 
.catch(function(error){
	console.log("Error on csv load");
	console.log(error)
})

