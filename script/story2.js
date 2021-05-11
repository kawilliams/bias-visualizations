
var margin = ({top: 3, right: 3, bottom: 3, left: 3});
var svgSize = {height: 210, width: 300}
var viewBoxSize = {height: 105, width: 150};


var circleBox = 10;
var radius = 3; //katy: change to 5
var algBoxSize = {height: 51, width: 44};
var thresholdShadeSize = {height: radius + circleBox, width: 5 * circleBox };

var circleCluster = {height: 6 * circleBox, width: 8 * circleBox};
var circleLine = {height: 1 * circleBox, width: 10 * circleBox};
var circleDoubleLine = {height: 2 * circleBox, width: 10 * circleBox};

var topTextSize = {height: 4, width: 144, fontsize: 3, space: 4};
var nextButtonSize = {height: 8, width: 20};
var captionSize = {fontsize: 3};

var padding = {text: 5};
var duration = 750;

var LABELCOST = 1;
var LABELHEALTH = 3;
var LABELEMERGENCY = 5;


var story = {
	model: undefined,
	views: [],
	controller: undefined,
	signals: {
		//List of signal types
		increment: 'INCREMENT',
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

	// The storyboard step (0 - 7)
	var _step = 0;

	// To determine what coloring scheme to use
	var _activeColor = 7;

	var _data = data;

	var _text = [
		"Below are 10 patients with varying levels of health and only 5 of them can be accepted into the high-risk care \n\
		management program to help with their chronic illnesses. We want to prioritize those that are sickest, so we'll\n\
		line them up from sickest to healthiest. We'll use an algorithm to help us.",
		"We have health record data, like diagnosis and procedure codes, insurance type, medications, care costs, and \n\
		the age and sex of the person. We'll use these data to predict future health care costs - a commonly-used \n\
		prediction label that is correlated with health.",
		"We apply the algorithm and align the circles from healthiest to sickest, with the sickest on the right.",
		"Let's examine the accuracy of our algorithm. Since we used health care costs as our label, the predicted health\n\
		costs should be very close to the actual health costs.",
		"But we care more about predicting patient health than predicting costs. \n\
		How well did the algorithm predict actual health?",
		"While health care costs and actual health needs are correlated, they aren't the same. The difference in the two\n\
		labels is not random with respect to socioeconomic and racial variables. Because of structural biases and \n\
		differential treatment, Black patients with similar needs to White patients have long been known to have lower \n\
		costs. Since our algorithm's label is cost, a Black patient and a White patient with the same number of chronic \n\
		illnesses will have dramatically different algorithmic scores.",
		"Let's try adding more health information into our label, making it a combination of health care costs and \n\
		health metrics.",
		"Now we can see that our algorithm is better at predicting health when we tell it to predict health and cost, \n\
		rather than only cost."
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
		{text: 'Not so good', x: 100, y: 65, step: 4, label: LABELCOST},
		{text: 'Not so good', x: 120, y: 65, step: 6, label: LABELCOST},
		{text: 'Much better!', x: 120, y: 65, step: 6, label: LABELHEALTH},
		{text: 'Not so good', x: 120, y: 65, step: 6, label: LABELEMERGENCY}
	];

	var _circleCaption = [
	{ text: "Patients\n", 
		x: circleCluster.width * 0.5 - 14, 
		y: -5 },
	{ text: "Patients\n", 
		x: circleCluster.width * 0.5 + 6,  
		y: -5 },
	{ text: "Predicted cost",
		x: -30,
		y: 9},
	{ text: "Predicted cost",
		x: -30,
		y: 9},
	{ text: "Predicted cost",
		x: -30,
		y: 9},
	{ text: "\n",
		x: margin.left,
		y: margin.top },
	{ text: "Predicted\n",
		x: margin.left + 5,
		y: margin.top }
	];

	var _shadowCaption = [
	{text: "\n",
		x: margin.left,
		y: 2 * circleBox
	},
	{text: "\n",
		x: margin.left,
		y: 2 * circleBox
	},
	{text: "\n",
		x: margin.left,
		y: 2 * circleBox
	},
	{text: "Actual cost\n",
		x: -25,
		y: 10 + 2 * circleBox
	},
	{text: "Actual health\n",
		x: -28,
		y: 10 + 2 * circleBox
	},
	{text: "Actual\n",
		x: margin.left,
		y: 10 + 2 * circleBox
	},
	{text: "Actual\n",
		x: margin.left + 5,
		y: 5 + 2 * circleBox
	}
	]

	return {
		//Increment the step & tell everyone
		increment: function() {
			_step += 1;
			_step = _step % 7; 

			if (_step == 5) _activeColor = 'black';
			else if (_step == 6) _activeColor = 7;

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
		//Get the circle color scheme
		getColor: function(d) {
			//d3.schemePaired
			//[Lblue, Dblue, Lgreen, Dgreen, Lred, Dred]
			var allColors = d3.schemePaired;
			console.log(allColors);

			var colorScale = d3.scaleLinear().domain([0,1])
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
		circleCaption: function() {
			return _circleCaption;
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
		.attr('viewBox', "0 0 " + (viewBoxSize.width * 1.5) + " " + (viewBoxSize.height * 1.5))
		.classed('svg-content', true)
		.attr("style", "outline: thin solid red;");

	var _cleanSVG = function() {
		while (_svg.firstChild) {
			_svg.removeChild(_svg.firstChild);
		}
	}
	var circleG = _svg.append('g')
		.attr('class', 'allCircles')
		.attr('id', 'circleG');
		// Move the patients to the right side
	circleG.attr('transform', 'translate('+ ((viewBoxSize.width - circleCluster.width) * 0.5 + margin.left) +',' + ((viewBoxSize.height - circleCluster.height) * 0.5 + topTextSize.height) + ')');

	var circles = circleG.selectAll('circle')
		.data(data)
		.enter()
		.append('circle')
		.attr('class', d => (d.id < 10) ? "patients" : "shadows");
	
	var circleShadows = circleG.selectAll('.shadows')
		.attr('r', 0);

	circles.attr('cx', d => d.x0 * circleBox )
		.attr('cy', d => d.y0 * circleBox )
		.attr('r', radius)
		.attr('fill', d => model.getColor(d));

	var step = model.get();

	var _circleCaption = circleG.append('text')
		.attr('id', 'circleCaption')
		.attr('font-weight', "bold");
	_circleCaption.selectAll('tspan.circlecaption')
		.data(d => {
			var text = model.circleCaption();
			return text[step].text.split('\n');
		})
		.enter()
		.append('tspan')
		.attr('class', 'circlecaption')
		.text(d => d)
		.attr('x', d => {
			var text = model.circleCaption();
			return text[step].x;
		})
		.attr('y', function(d,i){
			var step = model.get();
			var text = model.circleCaption();
			return text[step].y + (i*captionSize.fontsize);
		})
		.attr('font-size', captionSize.fontsize);

	var _shadowCaption = circleG.append('text')
		.attr('id', 'shadowCaption')
		.attr('font-weight', "bold")
		.attr('font-size', captionSize.fontsize);

	var thresholdG = _svg.append('g')
		.attr('class', 'allThreshold')
		.attr('id', 'thresholdG')
		.attr('transform', 'translate('+ (viewBoxSize.width * 0.5 + circleBox - radius) +',' + ( viewBoxSize.height * 0.5 - circleBox - topTextSize.height - radius) + ')');
	var _threshold = thresholdG.append('rect')
			.attr('id', "threshold")
			.attr('class', 'threshold')
			.attr('x', 0)
			.attr('y', -circleBox + radius -1)
			.attr('width', 2)
			.attr('height', 2 * circleBox)
			.attr('display', 'none');
	var _thresholdShade = thresholdG.append('rect')
			.attr('id', 'thresholdShade')
			.attr('class', 'threshold')
			.attr('x', 1)
			.attr('y', -circleBox * 0.5)
			.attr("width", thresholdShadeSize.width)
			.attr('height', thresholdShadeSize.height)
			.style('stroke', 'black')
			.style('stroke-width', '1px')
			.attr('opacity', 0)
			.attr('fill', 'none')
			.attr('display', 'none');
	var _thresholdText = thresholdG.append('text')
			.attr('id', 'thresholdText')
			.attr('class', 'threshold')
			.attr('x', 3)
			.attr('y', circleBox + radius)
			.text('Accepted into program')
			.attr('display', 'none')
			.style('font-size', captionSize.fontsize);

	var _moveCircles = function(step) {

		var circles = _svg.selectAll('circle')
			.transition()
			.duration(duration)
			.attr('cx', d => {
				var _x = d.x0;
				if (step == 1) _x = d.x1;
				if (step == 2) _x = d.x2;
				if (step == 3) _x = d.x3;
				if (step == 4) _x = d.x4;
				if (step == 5) _x = d.x5;
				if (step == 6) {
					var whichLabel = model.getLabel();
					if (whichLabel == LABELHEALTH) _x = d.x6health;
					else if (whichLabel == LABELCOST) _x = d.x6cost;
					else if (whichLabel == LABELEMERGENCY) _x = d.x6emergency;
					else { _x = d.x6; }
				}
				return _x * circleBox;
			})
			.attr('cy', d => {
				var _y = d.y0;
				if (step == 1) _y = d.y1;
				if (step == 2) _y = d.y2;
				if (step == 3) _y = d.y3;
				if (step == 4) _y = d.y4;
				if (step == 5) _y = d.y5;
				if (step == 6) {
					var whichLabel = model.getLabel();
					if (whichLabel == LABELHEALTH) _y = d.y6health;
					else if (whichLabel == LABELCOST) _y = d.y6cost;
					else if (whichLabel == LABELEMERGENCY) _y = d.y6emergency;
					else { _y = d.y6; }
				}
				return _y * circleBox;
			})
			.attr('fill', d => model.getColor(d))
			.style('stroke', (step == 5) ? 'black' : 'none');
		
		d3.selectAll('.circlecaption').remove();

		var circleCaption = d3.select("#circleCaption")
			.selectAll('tspan.circlecaption')
			.data(d => {
				var step = model.get();
				var text = model.circleCaption();
				return text[step].text.split('\n');
			})
			.enter()
			.append('tspan')
			.attr('class', 'circlecaption')
			.text(d => d)
			.attr('x', function(){
				var step = model.get();
				var text = model.circleCaption();
				return text[step].x;
			})
			.attr('y', function(d,i){
				var step = model.get();
				var text = model.circleCaption();
				return text[step].y + (i*5);
			})
			.style('font-size', captionSize.fontsize)
			.transition()
			.duration(duration)
			.attr('opacity', 1);


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
				if (step == 3 || step == 4 || step == 6) return 1;
				return 0;
			});
	}

	function _moveThreshold(step) {

		if (step >= 2 && step <= 5) {
			_svg.select('#thresholdShade')
				.attr('opacity', 0.2);
			_svg.selectAll('.threshold')
				.attr('display', 'inline')
				.transition()
				.duration(duration)
				.attr('opacity', function(){
					if (this.id == "thresholdShade") {
						return 0.2;
					}
					return 1;
				});
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
	
			_moveCircles(step, data);
			_moveThreshold(step);
		},
		register: function(fxn) {
			_observers.add(fxn);
		}
	}
}

var makeTopTextView = function(model, data, textID) {
	var _observers = makeObservers();
	var _svg = d3.select('#mySVG');
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
		.attr('y', (d,i) => i * topTextSize.space + margin.top)
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
			.attr('y', (d,i) => i * topTextSize.space + margin.top)
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


var makeInputView = function(model, inputID) {
	var _svg = d3.select('#mySVG');
	var _observers = makeObservers();
	var _inputLabels = model.inputs();
	var _inputG = _svg.append('g');

	var _labelRect = _inputG.selectAll('rect')
		.data(_inputLabels)
		.enter()
		.append('rect')
		.attr('id', d => d.id)
		.attr('class', 'labelClass')
		.attr('x', margin.left + 3)
		.attr('y', (d, i) => {
			return (i * algBoxSize.height * 0.35) + 10 + margin.top + topTextSize.height
		})
		.attr('width', algBoxSize.width * 0.8)
		.attr('height', algBoxSize.height * 0.3)
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
		.attr('x', margin.left + algBoxSize.width * 0.48)
		.attr('y', (d, i) => {
			return (i * algBoxSize.height * 0.35) + 9 + margin.top + topTextSize.height
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
			.attr('x', margin.left + algBoxSize.width * 0.48)
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
		.attr('x', d => d.x)
		.attr('y', d => d.y)
		.text(d => d.text)
		.style('font-size', '4px')
		.attr('opacity', 0);

	return {
		render: function() {
			var step = model.get();
			var label = model.getLabel();
			var isLabelActive = model.getLabelApplied();
			_commentary.attr('opacity', function(d) {
				if (((isLabelActive) || (step == 4)) && (d.step == step) && (d.label == label)) {
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

var makeButtonView = function(model, data, buttonID, svgID) {
	var _observers = makeObservers();

	var _btn = d3.select(svgID)
	.append('rect')
	.attr('id', buttonID)
	.attr('x', (viewBoxSize.width - nextButtonSize.width) * 0.5)
	.attr('y', viewBoxSize.height - margin.bottom - nextButtonSize.height)
	.attr('width', nextButtonSize.width)
	.attr('height', nextButtonSize.height)
	.attr('cursor', 'pointer')
	.style('fill', 'lightgrey')
	.style('rx', 3);

	var _btnText = d3.select(svgID)
		.append('text')
		.attr('x', (viewBoxSize.width - nextButtonSize.width) * 0.5 + 3)
		.attr('y', viewBoxSize.height - margin.bottom - nextButtonSize.height + 5)
		.text('NEXT: 0')
		.attr('cursor', 'pointer')
		.style('font-size', '4px');

	// The button event passes the appropriate
	//data to any listening controllers
	var _fireIncrementEvent = function() {
		_observers.notify({
			type: story.signals.increment
		});
	};

	_btn.on('click', _fireIncrementEvent);
	_btnText.on('click', _fireIncrementEvent);

	return {
		render: function() {
			_btnText.text("NEXT: " + model.get());
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
		story.views.push(makeTopTextView(story.model, d, '#textView'));
		story.views.push(makeSVGView(story.model, d, '#mySVG'));
		story.views.push(makeButtonView(story.model, d, '#nextButton', '#mySVG'));
		story.views.push(makeCommentaryView(story.model, d, '#mySVG'));
		story.views.push(makeInputView(story.model, '#inputs'))
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
