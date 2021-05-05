
var margin = ({top: 20, right: 30, bottom: 30, left: 30});

var circleBox = 14;
var algBoxSize = {height: 30, width: 90};
var radius = 5;
var viewBoxSize = {height: 150, width: 300};
var padding = {text: 20};
var duration = 750;
var thresholdShadeSize = {height: 19, width: 73 };

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
		management program to help with their chronic illnesses. We want to prioritize those that are sickest, so we'll line\n\
		them up from sickest to healthiest. We'll use an algorithm to help us.",
		"We have health record data, like diagnosis codes and health care costs. We'll use these data to predict future health\n\
		care costs - a commonly-used prediction label that is correlated with health.",
		"We apply the algorithm and align the circles from sickest to healthiest with the sickest on the left.",
		"Let's examine the accuracy of our algorithm. Since we used health care costs as our label \n\
		it should accurately predict costs.",
		"But we care more about predicting patient health than predicting costs. How well did the algorithm predict actual health?",
		"While health care costs and actual health needs are correlated, they aren't the same. The difference in the two varies\n\
		is not random with respect to socioeconomic and racial variables. Because of structural biases and differential treatment,\n\
		Black patients with similar needs to White patients have long been known to have lower costs.\n\
		Since our algorithm's label is cost, a Black patient and a White patient with the same number of chronic illnesses will have\n\
		dramatically different algorithmic scores.",
		"Let's try adding more health information into our label, making it a combination of health care costs and health metrics.\n",
		"Now we can see that our algorithm is better at predicting health when we tell it to predict health and cost, rather\n\
		than only cost."
	];

	var _inputLabels = [
		{text: "Age and sex", clicked: false},
		{text: "Insurance type", clicked: false}, 
		{text: "Diagnosis codes", clicked: false},
		{text: "Procedure codes", clicked: false},
		{text: "Medications", clicked: false},
		{text: "Costs", clicked: false}
	]

	var _circleCaption = [
	{ text: "Patients0\n", 
		x: margin.left, 
		y: viewBoxSize.height * 0.3 },
	{ text: "Patients1\n", 
		x: viewBoxSize.width * 0.7, 
		y: viewBoxSize.height * 0.3 },
	{ text: "2Algorithm-predicted health\n (based on insurance costs)",
		x: viewBoxSize.width * 0.2 - 36,
		y: viewBoxSize.height * 0.4 + radius},
	{ text: "3Algorithm-predicted health\n (based on insurance costs)",
		x: viewBoxSize.width * 0.2 - 36,
		y: viewBoxSize.height * 0.4 + radius},
	{ text: "4Algorithm-predicted health\n (based on insurance costs)",
		x: viewBoxSize.width * 0.2 - 36,
		y: viewBoxSize.height * 0.4 + radius},
	{ text: "5katy\n",
		x: margin.left,
		y: margin.top },
	{ text: "6Algorithm-predicted health\n (based on health metrics\n and insurance costs)",
		x: viewBoxSize.width * 0.2 - 36,
		y: viewBoxSize.height * 0.4 + radius},
	];

	var _shadowCaption = [
	{text: "Shadows0",
		x: margin.left,
		y: 2 * circleBox
	},
	{text: "Shadows1",
		x: margin.left,
		y: 2 * circleBox
	},
	{text: "Shadows2",
		x: margin.left,
		y: 2 * circleBox
	},
	{text: "3Actual insurance costs\n",
		x: viewBoxSize.width * 0.2 - 30,
		y: viewBoxSize.height * 0.6 + radius
	},
	{text: "4Actual health\n",
		x: viewBoxSize.width * 0.2 - 24,
		y: viewBoxSize.height * 0.6 + radius
	},
	{text: "5kt",
		x: margin.left,
		y: 3 * circleBox
	},
	{text: "6Actual health\n",
		x: viewBoxSize.width * 0.2 - 24,
		y: viewBoxSize.height * 0.6 + radius
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
		.attr('viewBox', "0 0 300 150")
		.classed('svg-content', true);

	var _cleanSVG = function() {
		while (_svg.firstChild) {
			_svg.removeChild(_svg.firstChild);
		}
	}
	
	var circles = _svg.selectAll('circle')
		.data(data)
		.enter()
		.append('circle')
		.attr('class', d => (d.id < 10) ? "patients" : "shadows");
	
	var circleShadows = _svg.selectAll('.shadows')
		.attr('r', 0);

	var circleShadowRace = _svg.selectAll('text')
		.data(data)
		.enter()
		.append('text')
		.text(d => d.race)
		.attr('class', d => (d.id < 10) ? "patients" : "shadows")
		.attr('x', d => d.x0 * circleBox)
		.attr('y', d => d.y0 * circleBox)
		.attr('display', d => (d.id < 10) ? "none" : "inline")

	circles.attr('cx', d => d.x0 * circleBox )
		.attr('cy', d => d.y0 * circleBox )
		.attr('r', radius)
		.attr('fill', 'orange');

	// Move the patients to the right side
	circles.attr('transform', 'translate('+ (viewBoxSize.width * 0.5 - 4 * circleBox) +',' + (2 * margin.top) + ')');
	circleShadowRace.attr('transform', 'translate('+ (viewBoxSize.width * 0.5 - 4 * circleBox) +',' + (2 * margin.top) + ')');

	var _circleCaption = _svg.append('text')
		.attr('id', 'circleCaption')
		.attr('x', viewBoxSize.width * 0.5)
		.attr('y', 40)
		.attr('font-weight', "bold");


	var step = model.get();

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
			return text[step].x
		})
		.attr('y', function(d,i){
			var step = model.get();
			var text = model.circleCaption();
			return text[step].y + (i*5);
		});

	var _shadowCaption = _svg.append('text')
		.attr('id', 'shadowCaption')
		.text('Shadows')
		.attr('font-weight', "bold");


	var _threshold = _svg.append('rect')
			.attr('id', "threshold")
			.attr('class', 'threshold')
			.attr('x', 4 * circleBox + radius + 1)
			.attr('y', circleBox + radius)
			.attr('width', 1)
			.attr('height', 1.5 * circleBox)
			.attr('transform', 'translate('+ (viewBoxSize.width * 0.5 - 4 * circleBox) +',' + (2 * margin.top) + ')')
			.attr('display', 'none');
	var _thresholdShade = _svg.append('rect')
			.attr('id', 'thresholdShade')
			.attr('class', 'threshold')
			.attr('x', -2 * radius)
			.attr('y', circleBox + radius)
			.attr('transform', 'translate('+ (viewBoxSize.width * 0.5 - 4 * circleBox) +',' + (2 * margin.top) + ')')
			.attr("width", thresholdShadeSize.width)
			.attr('height', thresholdShadeSize.height)
			.attr('fill', 'purple')
			.attr('opacity', 0)
			.attr('display', 'none');
	var _thresholdText = _svg.append('text')
			.attr('id', 'thresholdText')
			.attr('class', 'threshold')
			.attr('x', -radius)
			.attr('y', 2 * thresholdShadeSize.height + 5)
			.attr('transform', 'translate('+ (viewBoxSize.width * 0.5 - 4 * circleBox) +',' + (2 * margin.top) + ')')
			.text('Accepted into program')
			.attr('display', 'none')

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
				else if (step < 6) return sickColorScale(d.health);
				else if (step >= 6) return 'orange';
			});
		var circleShadows = _svg.selectAll('.shadows')
			.attr('r', d => {
				if (step == 3 || step == 4 || step == 5) return radius;
				return 0;
			});
			
		var circleShadowRace = _svg.selectAll('text.shadows')
			.transition()
			.duration(duration)
			.attr('x', d => {
				var _x = d.x0;
				if (step == 1) _x = d.x1;
				if (step == 2) _x = d.x2;
				if (step == 3) _x = d.x3;
				if (step == 4) _x = d.x4;
				if (step == 5) _x = d.x5;
				if (step == 6) _x = d.x6;
				return _x * circleBox;
			})
			.attr('y', d => {
				var _y = d.y0;
				if (step == 1) _y = d.y1;
				if (step == 2) _y = d.y2;
				if (step == 3) _y = d.y3;
				if (step == 4) _y = d.y4;
				if (step == 5) _y = d.y5;
				if (step == 6) _y = d.y6;
				return _y * circleBox;
			});
		d3.selectAll('.circlecaption').remove();

		var circleCaption = d3.select("#circleCaption")
			.selectAll('tspan.circlecaption')
			.data(d => {
				var step = model.get();
				var text = model.circleCaption();
				//console.log("what should appear", text[step].text);
				return text[step].text.split('\n');
			})
			.enter()
			.append('tspan')
			.attr('class', 'circlecaption')
			.text(d => {
				//console.log('should match',d);
				return d;
			})
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
		.attr('x', viewBoxSize.width * 0.5)
		.attr('y', margin.top)
		.attr('class', 'toptext')
		.attr('id', textID.replace('#',''))
		.attr('font-size', '12px')
		.attr('text-align', 'center');

	var text = model.text();

	topText.selectAll('tspan.toptext')
		.data(d => text[0].split('\n'))
		.enter()
		.append('tspan')
		.attr('class', 'toptext')
		.text(d => d)
		.attr('x', d =>  viewBoxSize.width * 0.5 - d.length )
		.attr('y', (d,i) => i * 7 + margin.top);

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
			.attr('x', d =>  viewBoxSize.width * 0.5 - d.length )
			.attr('y', (d,i) => i * 7 + margin.top);
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

	var _inputG = _svg.append('g');

	var _inputLabels = model.inputs();
	
	var _inputs = _inputG.selectAll('rect')
		.data(_inputLabels)
		.enter()
		.append('rect')
		.attr('class', 'algInputs')
		.attr("x", margin.left + 10)
		.attr("y", (d,i) => i * 14 + margin.top + 30)
		.attr('width', 50)
		.attr('height', 8)
		.attr('fill', 'lightsteelblue')
		.attr('cursor', 'pointer')
		.attr('display', 'none')
		.on('click', _changeColor);

	var _inputText = _inputG.selectAll('text')
		.data(_inputLabels)
		.enter()
		.append('text')
		.attr('class', 'algInputs')
		.attr('x', margin.left + 10 + padding.text)
		.attr('y', (d,i) => i * 14 + margin.top + 35)
		.text(d => d.text)
		.attr('cursor', 'pointer')
		.attr('display', 'none')
		.on('click', _changeColor);

	var _inputTitle = _inputG.append('text')
		.attr('class', 'algInputs')
		.attr('id', 'algInputsTitle')
		.text('Algorithm Inputs')
		.attr('x', margin.left + 10)
		.attr('y', margin.top + 20)
		.style('font-weight', 'bold')
		.attr('display', 'none');

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
		var _allInputRects = _svg.selectAll("rect.algInputs");
		var _allInputText = _svg.selectAll("text.algInputs");

		if (step == 1) {
			_allInputRects.attr('display', (d,i) => (i < 5) ? 'inline' : 'none');
			_allInputText.attr('display', (d,i) => (i < 5) ? 'inline' : 'none');
			_svg.select('#algInputsTitle').attr('display', 'inline');
			_svg.selectAll(".algInputs")
				.attr('opacity', 1);
		} 
		else if (step == 6) {
			_allInputRects.attr('display', 'inline');
			_allInputText.attr('display', 'inline');
			_svg.select('#algInputsTitle').attr('display', 'inline');
			_svg.selectAll(".algInputs")
				.attr('opacity', 1);
		}
		else {
			_svg.selectAll(".algInputs")
				.attr('display', 'none');
			_svg.selectAll(".algInputs")
				.attr('opacity', 0);
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
	.attr('x', viewBoxSize.width * 0.5 - 10)
	.attr('y', viewBoxSize.height - margin.bottom)
	.attr('width', 30)
	.attr('height', 12)
	.attr('cursor', 'pointer')
	.style('fill', 'lightsteelblue')
	.style('rx', 3);

	var _btnText = d3.select(svgID)
		.append('text')
		.attr('x', viewBoxSize.width * 0.5 - 5)
		.attr('y', viewBoxSize.height - margin.bottom + 7)
		.text('NEXT: 0')
		.attr('cursor', 'pointer')
		.style('font-size', '6px');

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
