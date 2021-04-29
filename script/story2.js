
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
	var _step = -1;

	var _data = data;

	var _text = [
		"Below are 10 patients with varying levels of health and only 5 of them can be accepted into the health program.\n\
		We want to line them up from sickest to healthiest. We'll use an algorithm to determine the level of health.",
		"We have insurance information, like number of doctor's visits. Let's select these data for our inputs\n\
		to our algorithm.",
		"We apply the algorithm and align the circles from sickest to healiest, with the sickest on the left.",
		"Let's see how accurate our algorithm was at predicting health. Since we input insurance costs into our algorithm\n\
		it should accurately predict costs.",
		"But we care more about predicting patient health then predicting costs. How well did the algorithm predict health?",
		"If we look at the patients, we notice a bad trend. ",
		"text 6 \n more text",
		"text 7 \n more text"
	];

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
		.attr('fill', '#EDC951');

		// Move the patients to the right side
	circles.attr('transform', 'translate('+ (viewBoxSize.width * 0.5 - 4 * circleBox) +',' + (2 * margin.top) + ')');



	var _makeTopText = function(step, text) {
		_svg.selectAll('.toptext').remove();
		var topText = _svg
			.append('text')
			// .attr('x', d =>  viewBoxSize.width * 0.5 - d.length )
			.attr('x', viewBoxSize.width * 0.5)
			.attr('y', margin.top)
			.attr('class', 'toptext')
			.attr('font-size', '12px')
			.attr('text-align', 'center');

		topText.selectAll('tspan')
			.data(d => text[step].split('\n'))
			.enter()
			.append('tspan')
			.text(d => d)
			.attr('x', d =>  viewBoxSize.width * 0.5 - d.length )
			.attr('y', (d,i) => i * 7 + margin.top);

	}
	return {
		render: function() {
			
			_cleanSVG();
			var step = model.get();
			var data = model.data();
			var text = model.text();
			//_makeCircles(step, data);
			_makeTopText(step, text);
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

		story.views.push(makeSVGView(story.model, d, '#mySVG'));
		story.views.push(makeButtonView(story.model, d, '#nextButton', '#mySVG'));
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
