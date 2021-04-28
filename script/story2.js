
var margin = ({top: 20, right: 30, bottom: 30, left: 30});

var circleBox = 12;
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
			console.log("Notify "+_subscribers.length+" listeners about ", args);
			for (var i = 0; i < _subscribers.length; i++) {
				console.log(_subscribers[i]);
				_subscribers[i](args);
	    	}
		}
	};
}

var makeModel = function(data) {
	//Make observers that can be notified
	var _observers = makeObservers();
	console.log("Model observers exist", _observers);

	// The storyboard step (0 - 8)
	var _step = 0;

	var _data = data;

	var _text = [
		"text 0 text 0 text 0 text 0 text 0 text 0 text 0 text 0 text 0 text 0 text 0 \n more text more text more text more text more text more text more text more text more text",
		"text 1 \n more text",
		"text 2 \n more text",
		"text 3 \n more text",
		"text 4 \n more text",
		"text 5 \n more text",
		"text 6 \n more text",
		"text 7 \n more text"
	];

	return {
		//Increment the step & tell everyone
		increment: function() {
			console.log('model increment');
			_step += 1;
			_observers.notify();
			console.log("**Increment complete\n**Observers notified to be at step", _step);
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
		//Add an observer to the model
		register: function(fxn) {
			_observers.add(fxn);
		}


	};

}

var makeSVGView = function(model, data, svgID) {
	//Make observers that can be notified
	var _observers = makeObservers();
	console.log("SVG observers exist", _observers);

	var _svg = d3.select(svgID)
		.attr('preserveAspectRatio', 'xMidYMid meet')
		.attr('viewBox', "0 0 300 150")
		.classed('svg-content', true);

	var _cleanSVG = function() {
		while (_svg.firstChild) {
			_svg.removeChild(_svg.firstChild);
		}
	}
	var _makeCircles = function(step, data) {
		var circles = _svg.selectAll('circle')
		.data(data)
		.enter()
		.append('circle');

		circles.attr('cx', d => d.x0 * circleBox )
			.attr('cy', d => d.y0 * circleBox )
			.attr('r', radius)
			.attr('fill', '#EDC951');

			// Move the patients to the right side
		circles.attr('transform', 'translate('+ (viewBoxSize.width * 0.5 - 4 * circleBox) +',' + (2 * margin.top) + ')');

	}

	var _makeTopText = function(step, text) {
		
		var topText = _svg.selectAll('text')
			.data(d => text[step].split('\n'))
			.enter().append('text')
			.attr('x', d =>  viewBoxSize.width * 0.5 - d.length )
			.attr('y', margin.top)
			.attr('font-size', '12px')
			.attr('text-align', 'center');

		topText.append('tspan')
			.text(d => d.trim())
			.attr('x', d =>  viewBoxSize.width * 0.5 - d.length )
			.attr('y', (d,i) => i * 7 + margin.top);

	}
	return {
		render: function() {
			
			_cleanSVG();
			var step = model.get();
			var data = model.data();
			var text = model.text();
			_makeCircles(step, data);
			_makeTopText(step, text);
		},
		register: function(fxn) {
			_observers.add(fxn);
		}
	}
}


var makeButtonView = function(model, data, buttonID, svgID) {
	var _observers = makeObservers();
	console.log("Button observers exist", _observers);

	var _btn = d3.select(svgID)
		.append('rect')
		.attr('id', buttonID)
		.attr('x', viewBoxSize.width * 0.5 - 10)
		.attr('y', viewBoxSize.height - margin.bottom)
		.attr('width', 24)
		.attr('height', 12)
		.attr('cursor', 'pointer')
		.style('fill', 'lightsteelblue')
		.style('rx', 3);

	var _btnText = d3.select(svgID)
		.append('text')
		.attr('x', viewBoxSize.width * 0.5 - 5)
		.attr('y', viewBoxSize.height - margin.bottom + 7)
		.text('NEXT: K')
		.style('font-size', '6px');

	// The button event passes the appropriate
	//data to any listening controllers
	var _fireIncrementEvent = function() {
		_observers.notify({
			type: story.signal.increment
		});
	};

	var _currentStep = model.get();

	_btn.on('click', _fireIncrementEvent);

	return {
		render: function() {

			var _currentStep = model.get();
			var t = _btnText.text().replace("K", _currentStep);
			_btnText.text(t);
			
		},
		register: function(fxn) {
			_observers.add(fxn);
		}
	}

}

var makeController = function(model) {
	var _increment = function() {
		console.log("controller telling model to increment");
		model.increment();
	}
	return {
		dispatch: function(evt) {
			console.log("Controller dispatch:", evt);
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

		story.views.push(makeSVGView(story.model, d, '#mySVG'));
		story.views.push(makeButtonView(story.model, d, '#nextButton', '#mySVG'));
		story.controller = makeController(story.model);
		
		for (var i=0; i < story.views.length; i++) {
			story.model.register(story.views[i].render());
			story.views[i].register(story.controller.dispatch());
		}

	}) 
	.catch(function(error){
		console.log("Error on csv load");
		console.log(error)
	})


})
