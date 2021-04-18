var height = 350,
	width = 550;
var radius = 3;
var margin = ({top: 50, right: 10, bottom: 30, left: 50});

var circleBox = 48;


d3.csv('script/patient-dot-data.csv').then(function(d){
	var svg = d3.select('#story1')
		.attr('height', height)
		.attr('width', width);

	var patients = svg.selectAll('g')
		.data(d)
		.join('g');

	patients.append('circle')
		.attr('class', 'dot')
		.attr('cx', d => d.x * circleBox + margin.left)
		.attr('cy', d => d.y * circleBox + margin.top )
		.attr('r', circleBox/3);
	patients.append('text')
		.attr('class', 'label')
		.attr('transform', d => {
			var x = d.x * circleBox + margin.left - (6);
			var y = d.y * circleBox + margin.top + 5;
			return "translate("+ x +","+ y +")";
		})
		.text(d => d.race)
		.attr('fill', d => d.race == 'B' ? 'black' : 'white')
		.attr('font-weight', d => d.race == 'B' ? 'bolder' : 'normal');

	// Move the patients to the right side
	patients.attr('transform', 'translate(240,40)');
		
}) 
.catch(function(error){
	console.log("Error on csv load");
	console.log(error)
})

/*
geom_smooth(aes(x = percentile, //
y = col_to_mean_by_percentile_by_race), //
method = "glm", //smoothing function used glm - Generalized Linear Models
formula = y~x, //formula used in smoothing function
method.args=list(family = gaussian(link = 'log')),
se = FALSE, //don't display the confidence interval
span = 0.99) + //controls amount of smoothing for the default loess smoother 

*/
