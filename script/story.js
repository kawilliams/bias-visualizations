
var margin = ({top: 30, right: 30, bottom: 30, left: 30});

var circleBox = 12;
var algBoxSize = {height: 30, width: 60};
var radius = 5;
var viewBoxSize = {height: 150, width: 300};
var padding = {text: 20};


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
		.attr("stdDeviation","2")
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
		.attr('cy', d => d.y * circleBox + margin.top + 10)
		.attr('r', radius)
		.attr('fill', '#EDC951');

	patients.append('text')
		.attr('class', 'label')
		.attr('transform', d => {
			var x = d.x * circleBox + margin.left - 2;
			var y = d.y * circleBox + margin.top + 12;
			return "translate("+ x +","+ y +")";
		})
		.text(d => d.race)
		.attr('fill', d => d.race == 'B' ? 'black' : 'white')
		.attr('font-weight', d => d.race == 'B' ? 'bolder' : 'normal')
		// .attr('font-size', '8px')
		.attr('opacity', 0);

	// Move the patients to the right side
	patients.attr('transform', 'translate('+ (viewBoxSize.width * 0.6) +',0)');


	var algorithmG = svg.append('g');

	var algorithmBox = algorithmG
		.append('rect')
		.attr('class', 'alg')
		.attr('x', viewBoxSize.width * 0.37)
		.attr('y', viewBoxSize.height * 0.28)
		.attr('height', algBoxSize.height)
		.attr('width', algBoxSize.width)
		.attr('fill', 'lightgrey')
		.on('click', initialSickFilter)
		.attr('cursor', 'pointer');

	var algorithmText = algorithmG
		.append('text')
		.text('Algorithm')
		.attr('x', viewBoxSize.width * 0.35 + padding.text)
		.attr('y', viewBoxSize.height * 0.28 + padding.text)
		.on('click', initialSickFilter)
		.attr('cursor', 'pointer');

	var inputBoxG = svg.append('g');
	var inputBoxRect = inputBoxG.append('rect')
		.attr('x', viewBoxSize.width * 0.1)
		.attr('y', viewBoxSize.height * 0.1)
		.attr('rx', 3)
		.attr('height', 90)
		.attr('width', 50)
		.attr('fill', 'lightsteelblue');

	var inputText = "Inputs:\n\
				Insurance claims info\n\
				Age\n\
				Number of doctors' visits\n\
				...\n\
				Health info:\n\
				Diagnoses\n\
				Metrics\n\
				...";

	var inputBoxText = inputBoxG.selectAll('text')
		.data(d => inputText.split("\n"))
		.enter()
		.append('text')
		.attr('x', viewBoxSize.width * 0.1)
		.attr('y', viewBoxSize.height * 0.1);

	inputBoxText.append('tspan')
		.attr('class', 'text')
		.text((d,i) => d)
		.attr('x', viewBoxSize.width * 0.1)
		.attr('y', (d,i) => i * 6 + margin.top)
		.attr('display', (d,i) => (i < 5) ? 'inline' : 'none')
		.attr('dy',6)
		.attr('dx',3);

	var nextBoxG = svg.append('g');
	var nextBox = nextBoxG.append('rect')
		.attr('class', 'next')
		.attr('x', viewBoxSize.width * 0.6 + margin.left)
		.attr('y', 85)
		.attr('height', 5)
		.attr('display', 'inline')
		.on('click', showPopUp);
	var nextBoxText = nextBoxG.append('text')
		.attr('class', 'next')
		.text('NEXT')
		.attr('x', viewBoxSize.width * 0.6 + margin.left + 3)
		.attr('y', 90)
		.attr('opacity', 0)
		.attr('cursor', 'pointer')
		.on('click', showPopUp);
		

	var popUpBoxG = svg.append('g').attr('id', 'popupboxg');
	var popUpBox = popUpBoxG.append('rect')
		.attr('id', 'popupbox')
		.attr('class', 'popup')
		.attr('rx', 8)
		.attr('width', 3)
		.attr('height', 3)
		.attr('display', 'none')
		.on('click', closePopUp);

	var text0 = "Remember, we used an algorithm\n\
				to determine a 'sick' score for \n\
				each patient. Let's see how the \n\
				algorithm did, and see if we \n\
				managed to get all of the sick\n\
				patients into the box."
	var popUpBoxText = popUpBoxG.selectAll('text')
		.data(d => text0.split('\n'))
		.enter()
		.append('text')
		.attr('class', 'popuptext')
		.attr('x', 10)
		.attr('y', 10);
		popUpBoxText.append('tspan')
		.attr('class', 'popuptext')
		.text(d => d)
		.attr('x', 10)
		.attr('y', (d,i) => i * 6 + margin.top)
		.attr('display', 'none');


	function initialSickFilter(d){
		d3.selectAll('.dots')
			.transition()
			.attr('fill', d => (d.x >= 2) ? '#84b046' : 'lightgrey'); //green
		// d3.selectAll(".exampleGlow")
		// 	.style('filter', 'url(#glow)');

		d3.select('rect.next')
			.transition()
			.attr('height', 7)
			.attr('width', 17)
			.attr('rx', 3)
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
			.attr('x', 100)
			.attr('y', 30)
			.attr('fill', 'white')
			.attr('stroke', 'lightsteelblue')
			.attr('height', 65)
			.attr('width', 100)
			.attr('opacity', 0.9);
		d3.selectAll('.popuptext')
			.transition()
			.attr('x', 120)
			.attr('y', (d,i) => i * 4 + 40)
			.attr("display", 'inline');

		d3.selectAll('.next')
			.transition()
			.attr('display', 'none');
	}

	function closePopUp() {

		d3.selectAll('.popuptext').remove();

		recolorPatients();

		d3.select('#popupbox')
			.transition()
			.attr('display','inline')
			.attr('x', viewBoxSize.width * 0.72)
			.attr('y', 0)
			.attr('fill', 'white')
			.attr('stroke', 'lightsteelblue')
			.attr('height', 50)
			.attr('width', 80)
			.attr('opacity', 0.9);
		
		var text1 = "Uh oh - some sick folks didn't make it into\n\
					the program. And if we look closer, we see most\n\
					of the patients who didn't make it are Black. \n\
					On the flip side, most of the healthy people who\n\
					got into the program are White.\n\nThis isn't fair."
		var popUpBoxG = d3.select("#popupboxg");
		var popUpBoxText = popUpBoxG.selectAll('text')
			.data(d => text1.split('\n'))
			.enter()
			.append('text')
			.attr('class', 'popuptext')
			.attr('x', viewBoxSize.width * 0.72)
			.attr('y', 10);
		popUpBoxText.append('tspan')
			.attr('class', 'popuptext')
			.text(d => d)
			.attr("x", viewBoxSize.width * 0.72)
			.attr('y', (d,i) => i * 6 + 10)
			.attr('display', 'inline');

	}

	function recolorPatients() {
		d3.selectAll('.dots')
		.transition()
		.attr('fill', d => (d.x > 0 && d.x < 4) ? '#84b046' : 'lightgrey');

		d3.selectAll('.label')
		.attr('opacity', 1);
	}
		
}) 
.catch(function(error){
	console.log("Error on csv load");
	console.log(error)
})

