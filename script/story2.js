
var margin = ({top: 20, right: 30, bottom: 30, left: 30});

var circleBox = 14;
var algBoxSize = {height: 30, width: 90};
var radius = 5;
var viewBoxSize = {height: 150, width: 300};
var padding = {text: 20};


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
		"Below are 10 patients with varying levels of health and only 5 of them can be accepted into the health program.\n\
		We want to line them up from sickest to healthiest. We'll use an algorithm to determine the level of health.",
		"We have insurance information, like number of doctor's visits. Let's select these data for our inputs\n\
		to our algorithm.",
		"We apply the algorithm and align the circles from sickest to healthiest, with the sickest on the left.",
		"Let's see how accurate our algorithm was at predicting health. Since we input insurance costs into our algorithm\n\
		it should accurately predict costs.",
		"But we care more about predicting patient health then predicting costs. How well did the algorithm predict health?",
		"If we look at the patients, we notice a bad trend. ",
		"text 6 \n more text",
		"text 7 \n more text"
	];

	var _inputLabels = [
		{text: "Input 1", clicked: false},
		{text: "Input 2", clicked: false}, 
		{text: "Input 3", clicked: false},
		{text: "Input 4", clicked: false},
		{text: "Input 5", clicked: false},
		{text: "Input 6", clicked: false},
		{text: "Input 7", clicked: false},
		{text: "Input 8", clicked: false}
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
	.append('circle');

	circles.attr('cx', d => d.x0 * circleBox )
		.attr('cy', d => d.y0 * circleBox )
		.attr('r', radius)
		.attr('fill', 'orange');

	// Move the patients to the right side
	circles.attr('transform', 'translate('+ (viewBoxSize.width * 0.5 - 4 * circleBox) +',' + (2 * margin.top) + ')');

	var threshold = _svg.append('rect')
			.attr('id', "threshold")
			.attr('x', 4 * circleBox + radius + 1)
			.attr('y', 3 * circleBox)
			.attr('width', 1)
			.attr('height', 1.5 * circleBox)
			.attr('transform', 'translate('+ (viewBoxSize.width * 0.5 - 4 * circleBox) +',' + (2 * margin.top) + ')')
			.attr('display', 'none');

	var _moveCircles = function(step) {
		var sickColorScale = d3.scaleLinear().domain([0,1])
			.range(["orange", "purple"]);
		var circles = _svg.selectAll('circle')
			.transition()
			.duration(750)
			.attr('cx', d => {
				var _x = d.x0;
				if (step == 1) _x = d.x1;
				if (step == 2) _x = d.x2;
		
				return _x * circleBox;
			})
			.attr('cy', d => {
				var _y = d.y0;
				if (step == 1) _y= d.y1;
				if (step == 2) _y = d.y2;
		
				return _y * circleBox;
			})
			.attr('fill', d => sickColorScale(d.pred_health));

	}

	function _moveThreshold(step) {

		if (step == 2) {
			_svg.select("#threshold")
			.transition()
			.attr('display', 'inline');
		} 
		else {
			_svg.select("#threshold")
			.transition()
			.attr('display', 'none');

		}
		

		
	}

	return {
		render: function() {
			
			_cleanSVG();
			var step = model.get();
			var data = model.data();
			//var text = model.text();
	
			_moveCircles(step, data);
			//_makeTopText(step, text);
			_moveThreshold(step);
		},
		register: function(fxn) {
			_observers.add(fxn);
		}
	}
}

var makeTextView = function(model, data, textID) {
	var _observers = makeObservers();

	var topText = d3.select('#mySVG')
		.append('text')
		.attr('x', viewBoxSize.width * 0.5)
		.attr('y', margin.top)
		.attr('class', 'toptext')
		.attr('id', 'textHome')
		.attr('font-size', '12px')
		.attr('text-align', 'center');

	var text = model.text();

	topText.selectAll('tspan')
		.data(d => text[0].split('\n'))
		.enter()
		.append('tspan')
		.attr('class', 'toptext')
		.text(d => d)
		.attr('x', d =>  viewBoxSize.width * 0.5 - d.length )
		.attr('y', (d,i) => i * 7 + margin.top);

	var _changeTopText = function(step, text) {
		
		d3.select('#textHome').selectAll('tspan.toptext').remove();
		d3.select('#textHome').selectAll('tspan.toptext')
			.data(d => text[step].split('\n'))
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
			_changeTopText(_step, _text);
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
		.attr("y", (d,i) => i * 14 + margin.top + 10)
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
		.attr('y', (d,i) => i * 14 + margin.top + 15)
		.text(d => d.text)
		.attr('cursor', 'pointer')
		.attr('display', 'none');

	function _changeColor() {
		d3.select(this).transition().attr('fill', (d) => {
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
		} else {
			_svg.selectAll(".algInputs").attr('display', 'none');
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
		story.views.push(makeTextView(story.model, d, '#textView'));
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
