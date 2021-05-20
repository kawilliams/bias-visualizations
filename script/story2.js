
var margin = ({top: 5, right: 3, bottom: 3, left: 3});
var svgSize = {height: 100, width: 100}
var viewBoxSize = {height: 157, width: 225};


var personBox = {width: 11, height: 14};
var radius = 5;
var radiusW = 5; //katy: change to 5
var radiusH = 7;
var labelBoxSize = {height: 15, width: 35, padding: 3};
var thresholdShadeSize = {height: 2 * personBox.height, width: 5 * personBox.width };

var peopleCluster = {height: 4 * personBox.height, width: 10 * personBox.width};

var topTextSize = {maxHeight: 4, maxWidth: 144, fontsize: 4, padding: 5};
var buttonSize = {height: 8, width: 20};
var captionSize = {fontsize: 3};

var padding = {text: 5};
var duration = 750;

var LABELCOST = 1;
var LABELHEALTH = 3;
var LABELEMERGENCY = 5;
var LABELNONE = 7;

var STEPCOUNT = 8;


var story = {
	model: undefined,
	views: [],
	controller: undefined,
	signals: {
		//List of signal types
		increment: 'INCREMENT',
		decrement: 'DECREMENT',
		changeColor: 'CHANGE_COLOR'
	}
}

var makeObservers = function() {
	var _subscribers = [];
	return {
		add: function(s) {
			_subscribers.push(s);
		},
		notify: function(args) {
			for (var i = 0; i < _subscribers.length; i++) {
				_subscribers[i](args);
	    	}
		}
	};
}

var makeModel = function(data) {
	//Make observers that can be notified
	var _observers = makeObservers();

	// The storyboard step (0 - STEPCOUNT)
	var _step = 0;

	// To determine what coloring scheme to use
	var _activeColor = LABELNONE;

	var _data = data;

	var _connectors = {
		predActCostInit: [], //length should be 9
		predActCostLabel: [], //length should be 1
		predActEmergency: [], //length should be 4
		predActHealth: [], // length should be 10
		predActProblem: [] // length should be 1
	};

	for (var i=0; i<data.length/2; i++) {
		var person = data[i+10];
		var shadow = data[i];
	
		if (person.problem == shadow.problem) {
			_connectors.predActProblem.push([[person.x4, person.y4], [shadow.x4, shadow.y4]]);
			_connectors.predActCostLabel.push([[person.x6cost, person.y6cost], [shadow.x6cost, shadow.y6cost]]);
		}
		if (person.cost == shadow.cost) {
			_connectors.predActCostInit.push([[person.x3, person.y3], [shadow.x3, shadow.y3]]);
		}
		if (person.health == shadow.health) {
			_connectors.predActHealth.push([[person.x6health, person.y6health], [shadow.x6health, shadow.y6health]]);
		}
		if (person.emergency == shadow.emergency) {
			_connectors.predActEmergency.push([[person.x6emergency, person.y6emergency], [shadow.x6emergency, shadow.y6emergency]]);
		}
	}
	

	var _text = [
		"Below are ten patients with varying levels of health and only five of them can be accepted into the high-risk\n\
		care management program to help with their chronic illnesses. We want to prioritize those that are sickest, so\n\
		we'll line them up from sickest to healthiest. We'll use an algorithm to help us score health levels.",
		"We have health record data, like diagnosis and procedure codes, insurance type, medications, care costs, and\n\
		the age and sex of the person. We'll use these data to predict future health care costs - a commonly-used prediction\n\
		label that is correlated with health.",
		"We apply the algorithm and align the circles from healthiest to sickest, with the sickest on the right. The five\n\
		sickest patients (the darkest blue circles) are accepted into the care management program.",
		"Let's examine the accuracy of our algorithm. Since we used care costs as our label, the predicted care costs should\n\
		be very close to the actual care costs.",
		"But we care more about predicting patient health than predicting future care costs.\n\
		How well did the algorithm predict actual health?",
		"While care costs and health needs are correlated, they aren't the same. The difference in the two labels is not random\n\
		with respect to socioeconomic and racial variables. Because of structural biases and differential treatment, the care\n\
		costs for Black patients will be lower than the care costs for a similarly ill White patient. Even though the algorithm\n\
		did not include race as an input, these societal inequalities produced dramatically different algorithmic scores and so\n\
		sicker people were excluded from the care program.",
		"We can fix this by changing our label to target from care costs to something that might be a closer approximation of \n\
		actual health for all patients. Click on the different labels (the colored rectangles) to see how closely the predictions\n\
		match the actual health.",
		"\n\nResearchers conducted experiments on the patient data to see which of the three label choices - active chronic\n\
		conditions, total care costs, emergency care cost - did the best job of (1) predicting the sickest patients, and\n\
		(2) mitigating bias in label choice. All three labels notably perform the same at predicting the 97th percentile\n\
		and above. However, there is a distinct variation across the three labels in the racial composition of the\n\
		highest-risk group: the fraction of Black patients at or above these risk levels ranges from 14.1% for the total\n\
		cost label to 26.7% for the chronic conditions label. This nearly twofold variation in composition of Black patients\n\
		in the highest-risk groups...\n\nThe bias attributable to label choice has impacts in algorithms used in the health sector..."
	];

	var _inputLabels = [
		{text: 'Predict\nHealth & Care\nCost', clicked: false, id: LABELHEALTH},
		{text: 'Predict\nCare\nCost', clicked: false, id: LABELCOST},
		{text: 'Predict\nEmergency Care\nCost', clicked: false, id: LABELEMERGENCY}
	];

	//Default is Predict Care Cost
	var _label = LABELCOST; 
	var _labelApplied = false;

	var _commentary = [
		{text: ['Pretty good!'], step: 3, label: LABELCOST},
		{text: ['Not so good'], step: 4, label: LABELCOST},
		{text: ["Much better!"], step: 6, label: LABELHEALTH},
		{text: ["The number of chronic conditions", "is similar to the actual health."], step: 6, label: LABELHEALTH},
		{text: ["Not so good"], step: 6, label: LABELCOST},
		{text: ["Using total care cost is not a fair","label."], step: 6, label: LABELCOST},
		{text: ["Not so good"], step: 6, label: LABELEMERGENCY},
		{text: ["Emergency costs is not a fair","label."], step: 6, label: LABELEMERGENCY}
		
	];

	var _personCaption = [
	{ text: "Patients\n", 
		x: viewBoxSize.width * 0.5 - 2 * captionSize.fontsize, 
		y: (viewBoxSize.height - peopleCluster.height) * 0.5 - topTextSize.maxHeight - 5},
	{ text: "Patients\n", 
		x: viewBoxSize.width * 0.5 - 2 * captionSize.fontsize + personBox.width,  
		y: (viewBoxSize.height - peopleCluster.height) * 0.5 - topTextSize.maxHeight - 5},
	{ text: "Predicted cost",
		x: (viewBoxSize.width - peopleCluster.width) * 0.5 - 8 * captionSize.fontsize,
		y: (viewBoxSize.height - peopleCluster.height) * 0.5 + radiusH},
	{ text: "Predicted cost",
		x: (viewBoxSize.width - peopleCluster.width) * 0.5 - 8 * captionSize.fontsize,
		y: (viewBoxSize.height - peopleCluster.height) * 0.5 + radiusH},
	{ text: "Predicted cost",
		x: (viewBoxSize.width - peopleCluster.width) * 0.5 - 8 * captionSize.fontsize,
		y: (viewBoxSize.height - peopleCluster.height) * 0.5 + radiusH},
	{ text: "\n",
		x: margin.left,
		y: margin.top },
	{ text: "Predicted\n",
		x: viewBoxSize.width * 0.5 - personBox.width * 4 - radiusW,
		y: viewBoxSize.height * 0.5 - personBox.height * 1.5},
	{ text: "\n",
		x: 0,
		y: 0
	}
	];
	
	var _shadowCaption = [
	{text: "\n",
		x: margin.left,
		y: 0 },
	{text: "\n",
		x: margin.left,
		y: 0 },
	{text: "\n",
		x: margin.left,
		y: 0 },
	{text: "Actual cost\n",
		x: viewBoxSize.width * 0.5 - peopleCluster.width - 8 * captionSize.fontsize,
		y: 4 + 2 * personBox.height },
	{text: "Actual health\n",
		x: viewBoxSize.width * 0.5 - peopleCluster.width - 9 * captionSize.fontsize,
		y: 4 + 2 * personBox.height },
	{text: "\n",
		x: margin.left,
		y: 10 + 2 * personBox.height },
	{text: "Actual\n",
		x: 5,
		y: 2 * personBox.height + 2 },
	{ text: "\n",
		x: 0,
		y: 0 }
	]



	return {
		//Increment the step & tell everyone
		increment: function() {
			_step += 1;
			_step = _step % STEPCOUNT; 

			if (_step == 0) _activeColor = LABELNONE;
			else if (_step == 5) _activeColor = 'black';
			else if (_step == 6) _activeColor = LABELNONE;
			else if (_step == 7) _activeColor = LABELHEALTH;
			else _activeColor == LABELCOST;
			_labelApplied = false;
			_observers.notify();
		},
		//Decrement the step & tell everyone
		decrement: function(){
			_step -= 1;
			if (_step == -1) _step = STEPCOUNT - 1;

			if (_step == 0) _activeColor = LABELNONE;
			else if (_step == 5) _activeColor = 'black';
			else if (_step == 6) _activeColor = LABELNONE;
			else if (_step == 7) _activeColor = LABELHEALTH;
			else  _activeColor = LABELCOST;
			_labelApplied = false;
			_observers.notify();
		},
		//Change the circles' color & label
		changeColor: function(index) {
			_activeColor = parseInt(index);
			_label = parseInt(index);
			_labelApplied = true;
			_observers.notify();
		},
		//Get the step
		get: function() {
			return _step;
		},
		//Get the csv data 
		data: function() {
			return _data;
		},
		//Get the story text 
		text: function() {
			return _text;
		},
		//Get the algorithm inputs
		inputs: function() {
			return _inputLabels;
		},
		//Get the connectors 
		connectors: function(){
			return _connectors;
		},
		//Get the circle color scheme
		getColor: function(d) {
			//d3.schemePaired
			//[Lblue, Dblue, Lgreen, Dgreen, Lred (changed), Dred (changed), Lorange, Dorange] 
			var allColors = ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#ffbbba","#c20000","#fdbf6f","#ff7f00"];
	
			var colorScale = d3.scaleLinear().domain([0,1,2])
			.range([allColors[_activeColor-1], allColors[_activeColor]]);
			
			if (_activeColor == LABELHEALTH) { //Pred Health & Cost
				return colorScale(d.health);
			}
			else if ((_activeColor == LABELCOST) && (_step <= 3)) { //Pred Cost
				return colorScale(d.cost);
			}
			else if ((_activeColor == LABELCOST) && (_step >= 4)) { //Show the difference cost & health
				return  colorScale(d.problem);
			}

			else if (_activeColor == LABELEMERGENCY) { //Pred Emergency Cost
				return colorScale(d.emergency);
			}
			else if (_activeColor == 'black') {
				return (d.race == 'B') ? 'black' : 'white';
			}
			else {
				return allColors[7];
			}
		},
		getLabel: function() {
			return _label;
		},
		getLabelApplied: function() {
			return _labelApplied;
		},
		getCommentary: function() {
			return _commentary;
		},
		getLabelColor: function(id, hover) {
			
			var allColors = d3.schemePaired;
			var colorScale = d3.scaleLinear().domain([0,1])
			.range([allColors[id-1], allColors[id]]);
			
			if (hover) return colorScale(0.2);//d3.schemePaired[id];
			return colorScale(0.5);
		},
		//Get the circle labels
		personCaption: function() {
			return _personCaption;
		},
		//Get the circle labels
		shadowCaption: function() {
			return _shadowCaption;
		},
		//Add an observer to the model
		register: function(fxn) {
			_observers.add(fxn);
		}
	};

}

var makeSVGView = function(model, data, svgID) {
	//Make observers that can be notified
	var _observers = makeObservers();

	var _svg = d3.select(svgID)
		.attr('preserveAspectRatio', 'xMidYMid meet')
		.attr('viewBox', "0 0 " + viewBoxSize.width + " " + viewBoxSize.height)
		.classed('svg-content', true);
		// .attr('style', 'outline: thin solid red;');

	// var _midlineV = _svg.append('line')
	// 	.attr('x1', viewBoxSize.width * 0.5)
	// 	.attr('y1', 0)
	// 	.attr('x2', viewBoxSize.width * 0.5)
	// 	.attr('y2', viewBoxSize.height)
	// 	.attr('stroke', 'black');
	// var _midlineH = _svg.append('line')
	// 	.attr('x1', 0)
	// 	.attr('y1', viewBoxSize.height * 0.5)
	// 	.attr('x2', viewBoxSize.width)
	// 	.attr('y2', viewBoxSize.height * 0.5)
	// 	.attr('stroke', 'black');


	var _cleanSVG = function() {
		while (_svg.firstChild) {
			_svg.removeChild(_svg.firstChild);
		}
	}
	var peopleG = _svg.append('g')
		.attr('class', 'allPeople')
		.attr('id', 'peopleG');
	// Move the patients to the right side
	peopleG.attr('transform', 'translate('+ ((viewBoxSize.width - peopleCluster.width) * 0.5 + margin.left) +',' + ((viewBoxSize.height - peopleCluster.height) * 0.5 + topTextSize.maxHeight) + ')');

	var step = model.get(); 

	var _connectorLines = peopleG.selectAll('line.connector')
		.data(data)
		.enter()
		.append('line')
		.attr('class', 'connector')
		.attr('stroke', 'grey')
		.attr('x1', d => d.x0 * personBox.width)
		.attr('y1', d => d.y0 * personBox.height)
		.attr('x2', d => d.x0 * personBox.width) //line starts at the feet
		.attr('y2', d => d.y0 * personBox.height) //and connects to the shadow head on transition
		.attr('opacity', 1); 

	// var makeBig = function(event) {
	// 	d3.select(this).transition().ease(d3.easeBounce)
	// 	.attr('r', radius + 3)
	// 	.transition()
	// 	.attr('r', radius);
	// }

	var showPatientId = function(event) {
		var circleId = d3.select(this).node().id.split('people')[1];
		d3.select("#text" + circleId).attr('opacity', 1);
	}
	var hidePatientId = function(event) {
		var circleId = d3.select(this).node().id.split('people')[1];
		d3.select("#text" + circleId).attr('opacity', 0);
	}		

	function personPath(startX, startY) {

        var path = "c-0.82,0.23,-1.3,0.62,-1.53,1.19c-0.1,0.27,-0.12,0.66,-0.1,2.58c0,0,0.03,2.26,0.03,2.26c0,0,0.26,0.55,0.26,0.55c0.14,0.3,0.34,0.63,0.44,0.74c0.27,0.29,0.31,0.4,0.67,2.58c0.18,1.09,0.37,2.1,0.43,2.23c0.19,0.39,0.46,0.5,1.3,0.5c0.81,0,1.04,-0.07,1.24,-0.43c0.09,-0.14,0.27,-0.98,0.46,-2.14c0.39,-2.3,0.43,-2.49,0.68,-2.74c0.31,-0.3,0.57,-0.9,0.7,-1.54c0.15,-0.85,0.15,-3.9,-0.02,-4.47c-0.15,-0.52,-0.57,-0.94,-1.17,-1.18c-0.41,-0.16,-0.62,-0.18,-1.75,-0.21c-0.87,-0.01,-1.41,0.02,-1.64,0.08zm0.88,-5.73c-0.44,0.1,-0.75,0.27,-1.18,0.65c-1.07,1,-1.07,2.71,0.02,3.71c0.55,0.51,0.98,0.67,1.73,0.67c0.51,0,0.7,-0.03,1.06,-0.21c1.56,-0.75,1.96,-2.8,0.79,-4.05c-0.6,-0.64,-1.57,-0.95,-2.42,-0.77z";
        start = "M " + startX + " " + startY;
        path = start + " " + path; 
        return path;
    }
	var people = peopleG.selectAll('path')
		.data(data)
		.enter()
		.append('path')
		.attr('class', d => (d.id < 10) ? "patients allPeople" : "shadows allPeople")
		.attr('id', d => "people" + d.id);

	var peopleToolTip = peopleG.selectAll('text.tooltip')
		.data(data)
		.enter()
		.append('text')
		.attr('class', 'tooltip')
		.attr('id', d => 'text' + d.id)
		.attr('x', d => d.x0 * personBox.width + radiusW + 1)
		.attr('y', d => d.y0 * personBox.height)
		.text(d => (d.id < 10) ? "Patient " + d.id : "")
		.attr('opacity', 0)
		.style('font-size', 3);

	var peopleShadows = peopleG.selectAll('.shadows')
		.attr('r', 0);

	people.attr("d", d => personPath(d.x0 * personBox.width, d.y0  * personBox.height))
		.style("stroke", "none")
		.style("fill", d => model.getColor(d))
		// .on('click', makeBig)
		.on('mouseenter', showPatientId)
		.on('mouseout', hidePatientId);


	var _raceKey = d3.select(svgID).append('g').attr('class', 'racekey');
	var _raceKeyRect = _raceKey.append('rect').attr('class', 'racekey')
		.attr('x', viewBoxSize.width / 2 - radiusW - 1)
		.attr('y', viewBoxSize.height/2 + radiusH + 5)
		.attr('width', 25)
		.attr('height', 18)
		.attr('fill', 'none')
		.style('stroke', 'black');

	var _raceCircles = _raceKey.selectAll('circle.racekey')
			.data([0,1])
			.enter()
			.append('circle')
			.attr('class', 'racekey')
			.attr('cx', viewBoxSize.width / 2)
			.attr('cy', d => (d * 8) + viewBoxSize.height/2 + radiusH + 10)
			.attr('r', 3)
			.attr('fill', d => (d == 0) ? 'black' : 'white')
			.style('stroke', 'black')
			.attr('opacity', 0);
		
	var _raceText = _raceKey.selectAll('text.racekey')
		.data([0,1])
		.enter()
		.append('text')
		.attr('class', 'racekey')
		.attr('x', viewBoxSize.width / 2 + radiusW + 1)
		.attr('y', d => (d * 8) + viewBoxSize.height/2 + radiusH + 11)
		.text(d => (d == 0) ? 'Black' : 'White')
		.style('font-size', captionSize.fontsize)
		.attr('opacity', 0);

	_raceKey.attr('display', 'none');

	var _personCaption = _svg.append('text')
		.attr('id', 'personCaption')
		.attr('font-weight', "bold");
	_personCaption.selectAll('tspan.circlecaption')
		.data(d => {
			var text = model.personCaption();
			return text[step].text.split('\n');
		})
		.enter()
		.append('tspan')
		.attr('class', 'circlecaption')
		.text(d => d)
		.attr('x', d => {
			var text = model.personCaption();
			return text[step].x;
		})
		.attr('y', function(d,i){
			var step = model.get();
			var text = model.personCaption();
			return text[step].y + (i*captionSize.fontsize);
		})
		.attr('font-size', captionSize.fontsize);

	var _shadowCaption = peopleG.append('text')
		.attr('id', 'shadowCaption')
		.attr('font-weight', "bold")
		.attr('font-size', captionSize.fontsize);

	var thresholdG = _svg.append('g')
		.attr('class', 'allThreshold')
		.attr('id', 'thresholdG')
		.attr('transform', 'translate('+ (viewBoxSize.width * 0.5) +',' + (viewBoxSize.height * 0.5 - thresholdShadeSize.height - personBox.height) + ')');

	var _thresholdShade = thresholdG.append('rect')
			.attr('id', 'thresholdShade')
			.attr('class', 'threshold')
			.attr('x', 0)
			.attr('y', radiusH)
			.attr("width", thresholdShadeSize.width)
			.attr('height', thresholdShadeSize.height)
			.style('stroke', 'lightgrey')
			.style('stroke-width', '1px')
			.attr('opacity', 0)
			.attr('fill', 'none')
			.attr('display', 'none');

	var _threshold = thresholdG.append('rect')
			.attr('id', "threshold")
			.attr('class', 'threshold')
			.attr('x', -1)
			.attr('y', 0.5 * radiusH)
			.attr('width', 2)
			.attr('height', thresholdShadeSize.height + radiusH)
			.attr('display', 'none');

	var _thresholdText = thresholdG.append('text')
			.attr('id', 'thresholdText')
			.attr('class', 'threshold')
			.attr('x', 3)
			.attr('y', 5)
			.text('Accepted into program')
			.attr('display', 'none')
			.style('font-size', captionSize.fontsize);

	var _movePeople = function(step) {

		var people = _svg.selectAll('path.allPeople')
			.transition()
			.duration(duration)
			.attr("d", d => {
				var _x = d.x0;
				var _y = d.y0;
				if (step == 1) { _x = d.x1; _y = d.y1; }
				if (step == 2) { _x = d.x2; _y = d.y2; }
				if (step == 3) { _x = d.x3; _y = d.y3; }
				if (step == 4) { _x = d.x4; _y = d.y4; }
				if (step == 5) { _x = d.x5; _y = d.y5; }
				if (step == 6) {
					var whichLabel = model.getLabel();
					var isLabelActive = model.getLabelApplied();
					
					if ((isLabelActive) && (whichLabel == LABELHEALTH)) { _x = d.x6health; _y = d.y6health; }
					else if ((isLabelActive) && (whichLabel == LABELCOST)) { _x = d.x6cost; _y = d.y6cost; }
					else if ((isLabelActive) && (whichLabel == LABELEMERGENCY)) { _x = d.x6emergency; _y = d.y6emergency;}
					else { _x = d.x6; _y = d.y6; }
				}
				if (step == 7) { _x = d.x7health; _y = d.y7health;}
				return personPath( _x * personBox.width, _y * personBox.height);
			})
			.style('fill', d => model.getColor(d))
			.style('stroke', (step == 5) ? 'black' : 'none');

		var _raceKey = d3.selectAll('.racekey').attr('display', (step == 5) ? 'inline' : 'none')
			.transition()
			.duration(duration)
			.attr('opacity', 1);
		
		d3.selectAll('.circlecaption').remove();

		var personCaption = d3.select("#personCaption")
			.selectAll('tspan.circlecaption')
			.data(d => {
				var step = model.get();
				var text = model.personCaption();
				return text[step].text.split('\n');
			})
			.enter()
			.append('tspan')
			.attr('class', 'circlecaption')
			.text(d => d)
			.attr('x', function(){
				var step = model.get();
				var text = model.personCaption();
				return text[step].x;
			})
			.attr('y', function(d,i){
				var step = model.get();
				var text = model.personCaption();
				return text[step].y + (i*5);
			})
			.style('font-size', captionSize.fontsize)
			.transition()
			.duration(duration)
			.attr('opacity', function() {
				if ((!model.getLabelApplied())&& (step == 6)) return 0;
				return 1;
			});


		var shadowCaption = d3.select("#shadowCaption")
			.text(function() {
				var step = model.get();
				var text = model.shadowCaption();
				return text[step].text;
			})
			.attr('x', function(){
				var step = model.get();
				var text = model.shadowCaption();
				return text[step].x;
			})
			.attr('y', function(){
				var step = model.get();
				var text = model.shadowCaption();
				return text[step].y;
			})
			.style('font-size', captionSize.fontsize)
			.transition()
			.duration(duration)
			.attr('opacity', function(){
				var step = model.get();
				if (step == 3 || step == 4) return 1;
				else if ((step == 6) && (model.getLabelApplied())) return 1;
				return 0;
			});

		d3.selectAll('line.connector').attr('opacity', 0);

		var connectors = d3.selectAll('line.connector')
			.data(function(){
				if (step == 3) return model.connectors().predActCostInit;
				if (step == 4) return model.connectors().predActProblem;
				if (step == 6) {
					var label = model.getLabel();
					var isLabelActive = model.getLabelApplied();
					if (isLabelActive && label == LABELHEALTH) return model.connectors().predActHealth;
					if (isLabelActive && label == LABELCOST) return model.connectors().predActCostLabel;
					if (isLabelActive && label == LABELEMERGENCY) return model.connectors().predActEmergency;
					else return model.connectors().predActCostInit;
				}
				else return model.connectors().predActCostInit;
			})
			.transition()
			.duration(duration)
			.attr('x1', d => d[0][0] * personBox.width + 1)
			.attr('y1', d => d[0][1] * personBox.height + 10)
			.attr('x2', d => d[1][0] * personBox.width + 1)
			.attr('y2', d => d[1][1] * personBox.height - 4)
			.attr('opacity', function(){
				var isLabelActive = model.getLabelApplied();
				if (step == 3 || step == 4) return 1;
				else if ((step == 6) && (isLabelActive)) return 1;
				return 0;
			});
	}

	function _moveThreshold(step) {

		if (step >= 2 && step <= 5) {
			_svg.select('#thresholdShade')
				.attr('opacity', 1);
			_svg.selectAll('.threshold')
				.attr('display', 'inline')
				.transition()
				.duration(duration)
				.attr('opacity',1);
		} 
		else {
			_svg.selectAll('.threshold') 
				.transition()
				.duration(duration)
				.attr('opacity', 0);
			_svg.selectAll('.threshold')
				.attr('display', 'none');
		}
	}

	return {
		render: function() {
			
			_cleanSVG();
			var step = model.get();
			var data = model.data();
	
			_movePeople(step, data);
			_moveThreshold(step);
		},
		register: function(fxn) {
			_observers.add(fxn);
		}
	}
}

var makeTopTextView = function(model, data, textID, svgID) {
	var _observers = makeObservers();
	var _svg = d3.select(svgID);
	var topText = _svg.append('text')
		.attr('x', margin.left)
		.attr('y', margin.top)
		.attr('class', 'toptext')
		.attr('id', textID.replace('#',''))
		.attr('text-align', 'center');

	var text = model.text();

	topText.selectAll('tspan.toptext')
		.data(d => text[0].split('\n'))
		.enter()
		.append('tspan')
		.attr('class', 'toptext')
		.text(d => d)
		.attr('x', d => margin.left)
		.attr('y', (d,i) => i * topTextSize.padding + margin.top)
		.attr('font-size', topTextSize.fontsize);

	var _changeTopText = function(step, text, textID) {
		d3.select(textID).selectAll('tspan.toptext').remove();
		d3.select(textID).selectAll('tspan.toptext')
			.data(d => {
				return text[step].split('\n');
			})
			.enter()
			.append('tspan')
			.attr('class', 'toptext')
			.text(d => d)
			.attr('x', d =>  margin.left )//viewBoxSize.width * 0.5 - d.length )
			.attr('y', (d,i) => i * topTextSize.padding + margin.top)
			.attr('font-size', topTextSize.fontsize);
	}

	return {
		render: function() {
			var _step = model.get();
			var _text = model.text();
			_changeTopText(_step, _text, textID);
		},
		register: function(fxn) {
			_observers.add(fxn);
		}
	}
}


var makeLabelView = function(model, inputID, svgID) {
	var _svg = d3.select(svgID);
	var _observers = makeObservers();
	var _inputLabels = model.inputs();
	var _inputG = _svg.append('g');

	var _labelRect = _inputG.selectAll('rect')
		.data(_inputLabels)
		.enter()
		.append('rect')
		.attr('id', d => d.id)
		.attr('class', 'labelClass')
		.attr('x', margin.left + 0.5 * labelBoxSize.width)
		.attr('y', (d, i) => {
			return i * (labelBoxSize.height + labelBoxSize.padding) + (viewBoxSize.height * 0.5 - 1.5 * labelBoxSize.height - 3);
		})
		.attr('width', labelBoxSize.width)
		.attr('height', labelBoxSize.height)
		.attr('fill', d => model.getLabelColor(d.id, false)) //green
		.attr('display', 'none')
		.attr("cursor", "pointer")
		.on('mouseenter', function(){
			d3.select(this).attr('fill', d => model.getLabelColor(d.id, true)); //light base color
		})
		.on('mouseout', function(){
			d3.select(this).attr('fill', d => model.getLabelColor(d.id, false)); //base color
		});
	var _labelLabel = _inputG.selectAll('text.labelClass')
		.data(_inputLabels)
		.enter()
		.append('text')
		.attr('id', d => d.id)
		.attr('class', 'labelClass')
		.attr('x', margin.left + (1.5 * labelBoxSize.width) + 4)
		.attr('y', (d, i) => {
			return i * (labelBoxSize.height + labelBoxSize.padding) + (viewBoxSize.height * 0.5 - 1.5 * labelBoxSize.height - 4);
		})
		.attr('display', 'none')
		.attr("cursor", "pointer")
		.on('mouseenter', function(d, data){
			var thisId = data.id;
			d3.selectAll('rect.labelClass').filter( c => (c.id == thisId))
				.attr('fill', c => model.getLabelColor(c.id, true)); //light color
		})
		.on('mouseout', function(d, data){
			var thisId = data.id;
			d3.selectAll('rect.labelClass').filter( c => (c.id == thisId))
				.attr('fill', c => model.getLabelColor(c.id, false)); //base color
		});

		_labelLabel.selectAll('tspan.labelClass')
			.data(d => d.text.split('\n'))
			.enter()
			.append('tspan')
			.attr('class', 'labelClass')
			.text(d => d)
			.attr('id', function() {
				return this.parentElement.id;
			})
			.attr('x', margin.left + (1.0 * labelBoxSize.width))
			.attr('dy', 5)
			.attr('text-anchor', 'middle')
			.attr("cursor", "pointer");

	function _moveInputs(step) {
		var _allAlgLabels = _svg.selectAll('.labelClass');
	
		if (step == 1) {
			_allAlgLabels.attr('display', function(){
				return (this.id == '1') ? 'inline' : 'none';
			});
		} 
		else if (step == 6) {
			_allAlgLabels.attr('display', 'inline');
		}
		else {
			_allAlgLabels.attr('display', 'none');
		}
	}

	// The button event passes the appropriate
	//data to any listening controllers
	var _fireChangeColor = function(evt) {
		_observers.notify({
			type: story.signals.changeColor,
			color: evt.target.id
		});
	};

	_labelRect.on('click', _fireChangeColor);
	_labelLabel.on('click', _fireChangeColor);

	return {
		render: function() {
			var step = model.get();
			_moveInputs(step);
		},
		register: function(fxn) {
			_observers.add(fxn);
		}
	}
}
var makeCommentaryView = function(model, data, svgID) {
	var _observers = makeObservers();
	
	var _commentary = d3.select(svgID).selectAll('text.commentary')
		.data(model.getCommentary())
		.enter()
		.append('text') 
		.attr('class', 'commentary')
		.attr('display', 'none');
	_commentary.selectAll('tspan.commentary')
		.data(d => d.text)
		.enter()
		.append('tspan')
		.attr('class', 'commentary')
		.text(d => d)
		.attr('x', d => {
			if ((d == "Pretty good!") ||
				(d == "Not so good") ||
				(d == "Much better!")) {
				return labelBoxSize.width + peopleCluster.width + personBox.width;
			}
			return 0.5 * viewBoxSize.width - 3 * personBox.width;
		})
		.attr('y', (d, i) => {
			if ((d == "Pretty good!") ||
				(d == "Not so good") ||
				(d == "Much better!")) {
				return 7 * personBox.height + 3;
			}
			return (i * captionSize.fontsize) + 8 * personBox.height;
		})
		.attr('font-size', captionSize.fontsize);
	

	return {
		render: function() {
			var step = model.get();
			var label = model.getLabel();
			var isLabelActive = model.getLabelApplied();
			d3.selectAll('text.commentary')
			.attr('display', function(d) {
				if (((step == 4) || (step == 3)) && (d.step == step)) {
					return 'inline';
				}
				if ((isLabelActive) && (d.step == step) && (d.label == label)) {
					return 'inline';
				}
				return 'none';
			})
			.transition()
			.attr('opacity', function(d) {
				if (((step == 4) || (step == 3)) && (d.step == step)) {
					return 1;
				}
				if (isLabelActive && (d.step == step) && (d.label == label)) {
					return 1;
				}
				return 0;
			});
		},
		register: function(fxn) {
			_observers.add(fxn);
		}
	}

}

var makeButtonView = function(model, data, backID, nextID, svgID) {
	var _observers = makeObservers();
	var buttonData = [{ 
		id: nextID, 
		text: "NEXT: 1", 
		x: (viewBoxSize.width - buttonSize.width) * 0.5 + buttonSize.width, 
		y: viewBoxSize.height - margin.bottom - buttonSize.height
	},{ 
		id: backID, 
		text: "BACK: 1",
		x: (viewBoxSize.width - buttonSize.width) * 0.5 - buttonSize.width, 
		y: viewBoxSize.height - margin.bottom - buttonSize.height
	}];
	var _buttons = d3.select(svgID).selectAll('rect.button')
		.data(buttonData)
		.enter()
		.append('rect')
		.attr('id', d => d.id)
		.attr('class', 'button')
		.attr('x', d => d.x)
		.attr('y', d => d.y)
		.attr('width', buttonSize.width)
		.attr('height', buttonSize.height)
		.attr('cursor', 'pointer')
		.style('fill', 'lightgrey')
		.style('rx', 3);

	var _forward = d3.select(nextID);
	var _backward = d3.select(backID);

	var _buttonsText = d3.select(svgID).selectAll('text.button')
		.data(buttonData)
		.enter()
		.append('text')
		.attr('id', d => d.id + 'text')
		.attr('class', 'button')
		.attr('x', d => d.x + 3)
		.attr('y', d => d.y + 5)
		.text(d => d.text)
		.attr('cursor', 'pointer')
		.style('font-size', '4px');

	var _forwardText = d3.select('#' + nextID + 'text');
	var _backwardText = d3.select('#' + backID + 'text');

	// The button event passes the appropriate
	//data to any listening controllers
	var _fireIncrementEvent = function() {
		_observers.notify({
			type: story.signals.increment
		});
	};
	var _fireDecrementEvent = function() {
		_observers.notify({
			type: story.signals.decrement
		});
	};

	_forward.on('click', _fireIncrementEvent);
	_backward.on('click', _fireDecrementEvent);
	_forwardText.on('click', _fireIncrementEvent);
	_backwardText.on('click', _fireDecrementEvent);

	return {
		render: function() {
			_forwardText.text("NEXT: " + (model.get() + 1));
			_backwardText.text("BACK: " + (model.get() + 1));
		},
		register: function(fxn) {
			_observers.add(fxn);
		}
	}

}

var makeController = function(model) {
	var _increment = function() {
		model.increment();
	}
	var _decrement = function() {
		model.decrement();
	}
	var _changeColor = function(args) {
		model.changeColor(args.color);
	}
	return {
		dispatch: function(evt) {
			if (evt){
				switch(evt.type){
				case story.signals.increment:
					_increment();
					break;
				case story.signals.decrement:
					_decrement();
					break;
				case story.signals.changeColor:
					_changeColor(evt);
					break;
				default:
					console.log("Unknown event type: ", evt);
				}
			}
			else {
				console.log("Initial load, no event yet");
			}


		}
	};
}
document.addEventListener("DOMContentLoaded", function(event){
	
	d3.csv('data/patient-dot-data.csv').then(function(d){

		story.model = makeModel(d);
		story.views.push(makeTopTextView(story.model, d, '#textView', '#mySVG'));
		story.views.push(makeSVGView(story.model, d, '#mySVG'));
		story.views.push(makeButtonView(story.model, d, 'backButton', 'nextButton', '#mySVG'));
		story.views.push(makeCommentaryView(story.model, d, '#mySVG'));
		story.views.push(makeLabelView(story.model, '#inputs', '#mySVG'))
		story.controller = makeController(story.model);
		
		for (var i=0; i < story.views.length; i++) {
			story.model.register(story.views[i].render);
			story.views[i].register(story.controller.dispatch);
		}

	}) 
	.catch(function(error){
		console.log("Error on csv load");
		console.log(error)
	})


})
