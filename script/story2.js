
var margin = ({top: 3, right: 3, bottom: 3, left: 3});
var svgSize = {height: 210, width: 300}
var viewBoxSize = {height: 105, width: 150};


var circleBox = 10;
var radius = 3; //katy: change to 5
var algBoxSize = {height: 51, width: 32};
var thresholdShadeSize = {height: radius + circleBox, width: 5 * circleBox };

var circleCluster = {height: 6 * circleBox, width: 8 * circleBox};
var circleLine = {height: 1 * circleBox, width: 10 * circleBox};
var circleDoubleLine = {height: 2 * circleBox, width: 10 * circleBox};

var topTextSize = {height: 4, width: 144, fontsize: 3, space: 4};
var nextButtonSize = {height: 8, width: 20};
var captionSize = {fontsize: 3};

var padding = {text: 5};
var duration = 750;


var story = {
	model: undefined,
	views: [],
	controller: undefined,
	signal: {
		//List of signal types
		increment: 'INCREMENT'
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

	var _data = data;

	var _text = [
		"Below are 10 patients with varying levels of health and only 5 of them can be accepted into the high-risk care \n\
		management program to help with their chronic illnesses. We want to prioritize those that are sickest, so we'll\n\
		line them up from sickest to healthiest. We'll use an algorithm to help us.",
		"We have health record data, like diagnosis and procedure codes, insurance type, medications, care costs, and \n\
		the age and sex of the person. We'll use these data to predict future health care costs - a commonly-used \n\
		prediction label that is correlated with health.",
		"We apply the algorithm and align the circles from sickest to healthiest with the sickest on the right.",
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
		{text: 'Predict\nHealth & Care Cost', clicked: false},
		{text: 'Predict\nCare Cost', clicked: false},
		{text: 'Predict\nEmergency Care Cost', clicked: false}
		// {text: "Age and sex", clicked: false},
		// {text: "Insurance type", clicked: false}, 
		// {text: "Diagnosis codes", clicked: false},
		// {text: "Procedure codes", clicked: false},
		// {text: "Medications", clicked: false},
		// {text: "Costs", clicked: false}
	];

	var _circleCaption = [
	{ text: "Patients0\n", 
		x: circleCluster.width * 0.5 - 14, 
		y: -5 },
	{ text: "Patients1\n", 
		x: circleCluster.width * 0.5 + 6,  
		y: -5 },
	{ text: "2Algorithm-predicted health\n (based on insurance costs)",
		x: -40,
		y: 9},
	{ text: "3Algorithm-predicted health\n (based on insurance costs)",
		x: -40,
		y: 9},
	{ text: "4Algorithm-predicted health\n (based on insurance costs)",
		x: -40,
		y: 9},
	{ text: "\n",
		x: margin.left,
		y: margin.top },
	{ text: "6Algorithm-predicted health\n (based on health metrics\n and insurance costs)",
		x: -40,
		y: 9},
	];

	var _shadowCaption = [
	{text: "0",
		x: margin.left,
		y: 2 * circleBox
	},
	{text: "1",
		x: margin.left,
		y: 2 * circleBox
	},
	{text: "2",
		x: margin.left,
		y: 2 * circleBox
	},
	{text: "3Actual insurance costs\n",
		x: -40,
		y: 9 + 2 * circleBox
	},
	{text: "4Actual health\n",
		x: -28,
		y: 9 + 2 * circleBox
	},
	{text: "5",
		x: -40,
		y: 9 + 2 * circleBox
	},
	{text: "6Actual health\n",
		x: -40,
		y: 9 + 2 * circleBox
	}
	]

	return {
		//Increment the step & tell everyone
		increment: function() {
			_step += 1;
			_step = _step % 7; 
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

	// var circleShadowRace = circleG.selectAll('text')
	// 	.data(data)
	// 	.enter()
	// 	.append('text')
	// 	.text(d => d.race)
	// 	.attr('class', d => (d.id < 10) ? "patients" : "shadows")
	// 	.attr('x', d => d.x0 * circleBox)
	// 	.attr('y', d => d.y0 * circleBox)
	// 	.attr('display', 'none');

	circles.attr('cx', d => d.x0 * circleBox )
		.attr('cy', d => d.y0 * circleBox )
		.attr('r', radius)
		.attr('fill', 'orange');

	// Move the patients to the right side
	// circles.attr('transform', 'translate('+ ((viewBoxSize.width - circleCluster.width) * 0.5 + margin.left) +',' + ((viewBoxSize.height - circleCluster.height) * 0.5 + margin.top + topTextSize.height) + ')');
	// circleShadowRace.attr('transform', 'translate('+ ((viewBoxSize.width - circleCluster.width) * 0.5 + margin.left) +',' + ((viewBoxSize.height - circleCluster.height) * 0.5 + margin.top + topTextSize.height) + ')');

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
		var sickColorScale = d3.scaleLinear().domain([0,1])
			.range(["orange", "purple"]);

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
				if (step == 6) _x = d.x6;
				return _x * circleBox;
			})
			.attr('cy', d => {
				var _y = d.y0;
				if (step == 1) _y = d.y1;
				if (step == 2) _y = d.y2;
				if (step == 3) _y = d.y3;
				if (step == 4) _y = d.y4;
				if (step == 5) _y = d.y5;
				if (step == 6) _y = d.y6;
				return _y * circleBox;
			})
			.attr('fill', d => {
				if (step == 0) return 'orange';
				else if (step < 4) return sickColorScale(d.cost);
				else if (step == 5) return (d.race == 'B') ? 'darkgrey' : 'white';
				else if (step < 6) return sickColorScale(d.health);
				else if (step >= 6) return 'orange';
			})
			.style('stroke', (step == 5) ? 'black' : 'none');
		var circleShadows = _svg.selectAll('.shadows')
			.attr('r', d => {
				if (step == 3 || step == 4 || step == 5) return radius;
				return 0;
			});

		// var circleShadowRace = _svg.selectAll('text.shadows')
		// 	.transition()
		// 	.duration(duration)
		// 	.attr('x', d => d.x5 * circleBox - 2)
		// 	.attr('y', d => d.y5 * circleBox + 2)
		// 	.attr('display', d => {
		// 	var step = model.get();
		// 	if ((step == 5) ){//&& (d.id >= 10)) {
		// 		return "inline";
		// 	} else { return "none"; }
		// 	});
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
				if (step == 3 || step == 4) return 1;
				return 0;
			});
	}

	function _moveThreshold(step) {

		if (step >= 2 && step <= 5) {
			_svg.select('#thresholdShade')
				.attr('opacity', 0.2);
			_svg.selectAll('.threshold')//("#threshold")
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
			_svg.selectAll('.threshold') //("#threshold")
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
		.attr('class', 'labelClass')
		.attr('x', margin.left + 3)
		.attr('y', (d, i) => {
			return (i * algBoxSize.height * 0.35) + 10 + margin.top + topTextSize.height
		})
		.attr('width', algBoxSize.width * 0.8)
		.attr('height', algBoxSize.height * 0.3)
		.attr('fill', '#74c476') //green
		.attr('display', 'none')
		.attr("cursor", "pointer")
		.on('click', _changeColor);
	var _labelLabel = _inputG.selectAll('text.labelClass')
		.data(_inputLabels)
		.enter()
		.append('text')
		.attr('class', 'labelClass')
		.attr('id', 'labelText')
		.attr('x', margin.left + 5)
		.attr('y', (d, i) => {
			return (i * algBoxSize.height * 0.35) + 15 + margin.top + topTextSize.height
		})
		.text(d => d.text)
		.attr('display', 'none')
		.attr("cursor", "pointer")
		.on('click', _changeColor);

	function _changeColor() {
		d3.select(this).attr('fill', (d) => {
			if (d.clicked) {
				d.clicked = false;
				return 'lightsteelblue';
			}
			else {
				d.clicked = true;
				return '#33bbbb';
			}
		});
		
	}

	function _moveInputs(step) {
		var _allAlgLabels = _svg.selectAll('.labelClass');

		if (step == 1) {
			_allAlgLabels.attr('display', d => (d.text == "Predict\nCare Cost") ? 'inline' : 'none');
		} 
		else if (step == 6) {
			_allAlgLabels.attr('display', 'inline');
		}
		else {
			_allAlgLabels.attr('display', 'none');
		}
	}

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
	.style('fill', 'lightsteelblue')
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
			type: story.signal.increment
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
	return {
		dispatch: function(evt) {
			if (evt){
				switch(evt.type){
				case story.signal.increment:
					_increment();
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
