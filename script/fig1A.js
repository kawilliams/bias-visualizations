var height = 500,
	width = 500;

var radius = 3;
var margin = ({top: 50, right: 10, bottom: 40, left: 50});
var slider = {handle: 8, bar: 4};

function drawMySVG(mySVGID, mySVGClass){
	// Load the data and run the graph
	// Data: race, risk_score_quantile, num_chronic_conds_mean, ci
	d3.csv("data/figure1a_replicate_request.csv").then(function(d){

		// x: Percentile of Algorithm Risk Score
		var x = d3.scaleLinear()
			.domain([0, 100])
			.range([margin.left, width-margin.right]);

		var xAxis = g => g
			.attr('transform', 'translate(0, ' + (height - margin.bottom) + ' )')
			.attr('class', 'xAxis ' + mySVGClass)
			.call(d3.axisBottom(x).ticks(10))
			.call(g => g.selectAll(".tick line").clone()
				.attr("y2", -height+margin.top)
				.attr("stroke", "black")
				.attr("stroke-opacity", 0.1))
			.call(g => g.append("text")
				.attr("x", width - 4)
				.attr("y", -4)
				.attr("font-weight", "bold")
				.attr("text-anchor", "end")
				.attr("fill", "black")
				.text(d.x));

		// // y: Number of active chronic conditions
		var y = d3.scaleLinear()
			.domain([0, Math.ceil(d3.max(d, function(d){ return d.num_chronic_conds_mean; }))])
			.range([height - margin.bottom, margin.top]);

		var yAxis = g => g
			.attr('transform', 'translate('+ margin.left + ',0)')
			.attr('class', 'yAxis ' + mySVGClass)
			.call(d3.axisLeft(y).ticks(null,".1f"))
			.call(g => g.selectAll(".tick line").clone()
				.attr("x2", width)
				.attr("stroke", "black")
				.attr("stroke-opacity", 0.1))
	   		.call(g => g.select(".tick text").clone()
	        	.attr("x", 4)
		        .attr("text-anchor", "start")
		        .attr("font-weight", "bold")
		        .attr("fill", "black")
	        .text(d.y));


		var svg = d3.select(mySVGID)
		.attr('class', mySVGClass)
		.attr('height', height)
		.attr('width', width);

		// Add rect to show shading past the 55%ile threshold
		svg.append('rect')
			.attr('class', mySVGClass)
			.attr('id', "katy")
			.attr('x', x(55))
			.attr('y', y(5.5))
			.attr('width', x(100) - x(55) + 10)
			.attr('height', height - margin.top + 12)
			.attr('fill', 'lightsteelblue')
			.attr('opacity', 0.3); //0.6

		var blackPoints = [];
		var whitePoints = [];
		for (var i=0; i<d.length; i++){
			var t = [d[i].risk_score_quantile, d[i].num_chronic_conds_mean];
			(i % 2 == 0) ? blackPoints.push(t) : whitePoints.push(t);
		}

		var exponentialRegression = d3.regressionExp()
				.x(d => d[0])
				.y(d => d[1])
				.domain([0, 100]);
		var blackCurve = exponentialRegression(blackPoints);
		var whiteCurve = exponentialRegression(whitePoints);

		var lineGenerator = d3.line()
			.x(d => x(d[0]))
			.y(d => y(d[1]));

		// purple/Black line of best fit
		svg.append("path")
			.data(blackCurve)
			.attr("d", lineGenerator(blackCurve))
			.attr('class', mySVGClass)
			.style("stroke", "purple")
			.style("fill", "none")
			.style('stroke-width', "1px")
			.style('stroke-dasharray', '5')
		
	 	// orange/White line of best fit
		svg.append("path")
			.data(whiteCurve)
			.attr("d", lineGenerator(whiteCurve))
			.attr('class', mySVGClass)
			.style("stroke", "orange")
			.style("fill", "none")
			.style('stroke-width', "1px")
			.style('stroke-dasharray', '0')

		svg.append('g')
			.attr('id', 'xAxisGroup')
			.attr('class', mySVGClass)
			.call(xAxis);

		//xAxis label
		svg.select('#xAxisGroup')
			.append('text')
			.attr('id', 'xAxisLabel')
			.attr('class', mySVGClass)
			.attr('x', 270)
			.attr('y', 30)
			.attr('fill', 'black')
			.text('Percentile of Algorithm Risk Score');

		svg.append('g')
			.attr('id', 'yAxisGroup')
			.attr('class', mySVGClass)
			.call(yAxis);
		//yAxis label
		svg.select('#yAxisGroup')
			.append('text')
			.attr('id', 'yAxisLabel')
			.attr('class', mySVGClass)
			.attr('transform', 'rotate(-90)')
			.attr('x', -180)
			.attr('y', -30)
			.attr('fill', 'black')
			.text('Number of Active Chronic Conditions');


		// Add percentile lines marking "defaulted" (97%) and "referred" (55%)
		var cutoffLines = [{percentile: 55, text: 'Referred for screening'},
							{percentile: 97, text: 'Defaulted into program'}];
		svg.append('g')
			.selectAll('line')
			.data(cutoffLines)
			.join('line')
				.attr('class', mySVGClass)
				.attr('x1', d => x(d.percentile))
				.attr('x2', d => x(d.percentile))
				.attr('y1', d => y(0))
				.attr('y2', 20)
				.attr('stroke', d => 'black')
				.attr('stroke-width', 2)
				.attr('stroke-dasharray', 5);

		// Add percentile cutoff lines' labels
		svg.append('g')
			.selectAll('text')
			.data(cutoffLines)
			.enter()
			.append('text')
				.attr('class', mySVGClass)
				.attr('transform', d => 'translate('+(x(d.percentile)-5)+', 10) rotate(-90)')
				.attr('fill', d => 'black')
				.text(d => d.text)
				.attr('text-anchor', 'end');
			
		// Add legend (Black: purple, White; orange)
		var legendColors = [{color: "orange" , path: "M60,55 l45,0" , 
							dasharray: "0", race: "White"},
							{color: "purple" , path: "M60,70 l50,0" , 
							dasharray: "5 5", race: "Black"}];
		// Add legend 
		svg.append('g')
			.selectAll('path')
			.data(legendColors)
			.join('path')
			.attr('class', mySVGClass)
			.attr('d', d => d.path)
			.attr('stroke', d => d.color)
			.attr('stroke-dasharray', d => d.dasharray)
			.attr('stroke-width', 2)
			.attr('fill', 'none');
		svg.append('g')
			.selectAll('text')
			.data(legendColors)
			.enter()
			.append('text')
			.attr('class', mySVGClass)
			.attr('x', 110)
			.attr('y', d => (d.race == 'Black') ? 72 : 57)
			.text(d => d.race);

		// Add confidence intervals at dots
		var confInterval = svg.append('g')
			.selectAll('g')
			.data(d)
			.join('g');

		confInterval.append('line')
			.attr('class', 'ci ' + mySVGClass)
			.attr('id', (d,i)=> {
				return i+"ci";
			})
			.attr('x1', d => x(d.risk_score_quantile))
			.attr('y1', d => {
				d.ci = +d.ci;
				d.num_chronic_conds_mean = +d.num_chronic_conds_mean;
				return y(d.num_chronic_conds_mean + d.ci)
			})
			.attr('x2', d => x(d.risk_score_quantile))
			.attr('y2', d => y(d.num_chronic_conds_mean - d.ci))
			.attr('stroke', 'black')
			.attr('stroke-width', 1);

		//Add data points
		var dataCircles = svg.append('g')
			.selectAll('circle')
				.data(d)
				.join('circle')
				.attr('id', (d,i)=>{ return "circle"+i; })
				.attr('class', mySVGClass)
				.attr('cx', d => x(+d.risk_score_quantile))
				.attr('cy', d => y(+d.num_chronic_conds_mean))
				.attr('r', radius)
				.attr('fill', d => (d.race == 'Black') ? '#764885' : '#ffa600')
				.attr('stroke', d => (d.race == 'Black') ? '#764885' : '#ffa600');

		var allLabelsG = svg.append('g');
		var label = allLabelsG.selectAll('rect')
			.data(d)
			.enter()
			.append('rect')
			.attr('class', d =>  "labels label"+d.id+" "+mySVGClass)
			.attr('width', 80)
			.attr('height', 40)
			.attr('fill', 'lightgrey')
			.attr('rx', 2)
			.attr('display', 'none') 
			.attr('x', d => (d.orient == "left") ? x(d.risk_score_quantile) - 80 : x(d.risk_score_quantile))
			.attr('y', d => (d.orient == "left") ? y(d.num_chronic_conds_mean) - 40 : y(d.num_chronic_conds_mean));

		var labelText = allLabelsG.selectAll('text')
			.data(d)
			.enter()
			.append('text')
			.attr('class', d =>  "labels label"+d.id+" "+mySVGClass)
			.attr('display', 'none')
			.attr('x', d => (d.orient == "left") ? x(d.risk_score_quantile) - 80 : x(d.risk_score_quantile))
			.attr('y', d => (d.orient == "left") ? y(d.num_chronic_conds_mean) - 40 : y(d.num_chronic_conds_mean));

			labelText.selectAll('tspan')
			.data(d => [d.num_chronic_conds_mean, d.risk_score_quantile, d.race])
			.enter()
			.append('tspan')
			.attr('class', function(d){ return this.parentElement.className.baseVal; })
			.text(function(d){
				if (d == "Black" | d == "White") { return "Race: " + d; }
				if (+d >= 10) { return "Percentile: " + d; }
				if (d < 5) { return "Conditions: " + d.toFixed(2); }
				return d;
			})
			.attr('display', 'none')
			.attr('x', function() { return this.parentElement.x.baseVal[0].value + 3; })
			.attr('dy', '1.2em')

		dataCircles
			.on('mouseover', showDotToolTip)
			.on('mouseout', hideDotToolTip);

		var toolTipG = svg.append('g')
				.attr('class', mySVGClass);

		var toolTip = toolTipG.append('rect')
				.attr('id', 'tooltip')
				.attr('class', mySVGClass)
				.attr('height', 127)
				.attr('width', 280)
				.attr('x', 90) //(event.x - 170)
				.attr('y', 120) //(500 - event.x)
				.attr('fill', 'lightsteelblue')
				.attr('rx', 5)
				.attr('opacity', '1');

		var toolTipText = { instructions: "Health providers used an algorithm to determine\n\
										  which patients would get referred for and accepted\n\
										  into an extra care program. The x-axis shows a \n\
										  patient's risk score, and the y-axis shows how \n\
										  healthy the patient is, based on the number of \n\
										  chronic conditions. A higher risk score equates to\n\
										  a higher chance to receive extra care. \n\
										  Move the sliders to explore.",
					horizTextAcrossThreshold: "Two patients at this level would be \n\
								equally sick (Y conditions), but to the\n\
								algorithm the Black patient needed to\n\
								be more sick to be referred.",
					horizTextSameSide: "Two patients at this level would be \n\
								equally sick (Y conditions), but to the\n\
								algorithm the Black patient needed to\n\
								be more sick to be scored higher.",
					vertText:  "Both patients at this point received the\n\
								same score from the algorithm (X percentile)\n\
								but the Black patient would have diff more\n\
								conditions than the White patient."
					};
		var toolTipTextElement = toolTipG.selectAll('text.'+mySVGClass)
				.data(d => toolTipText.instructions.split("\n"))
				.enter()
				.append("text")
				.attr('class', 'tiptext ' +mySVGClass)
				.attr('x', 95) //(event.x - 170)
				.attr('y', 130) //(500 - event.x)
				.attr('font-size', 12);
			toolTipTextElement
				.append('tspan')
				.attr('class', 'tiptext '+mySVGClass)
				.text(d => d)
				.attr('x',95)
				.attr('y', (d,i) => i * 15 + 135);
				
		// Slider
		var sliderClass = (mySVGClass.includes('vert')) ? 'vertSlider' : 'horizSlider';
		var sliderId = (mySVGClass.includes('vert')) ? 'vertSliderBar' : 'horizSliderBar';
		var handleId = (mySVGClass.includes('vert')) ? 'vertSliderHandle' : 'horizSliderHandle';

		var sliderX = (mySVGClass.includes('vert')) ? x(82) : x(-1.5);
		var sliderY = (mySVGClass.includes('vert')) ? y(5.3) : y(1.2);
		var sliderHeight = (mySVGClass.includes('vert')) ? 460 : slider.bar;
		var sliderWidth = (mySVGClass.includes('vert')) ? slider.bar : 450;
		
		var handleX = (mySVGClass.includes('vert')) ? x(82)-2 : x(55)-25;
		var handleY = (mySVGClass.includes('vert')) ? y(2.5)-25 : y(1.2)-2;
		var handleHeight = (mySVGClass.includes('vert')) ? 50 : slider.handle;
		var handleWidth = (mySVGClass.includes('vert')) ? slider.handle : 50;
		

		var dragSlider = d3.drag()
				.on('start', dragstarted)
				.on('drag', draggedVert)
				.on('end', dragend);

		var sliderBar = svg.append('rect')
				.attr('class', sliderClass + " " + mySVGClass)
				.attr('id', sliderId)
				.attr('x', sliderX)
				.attr('y', sliderY)
				.attr('rx', 5)
				.attr('height', sliderHeight)
				.attr('width', sliderWidth)
				.attr('fill', 'lightsteelblue')
				.attr('opacity', 0.7)
				.attr('cursor', 'pointer');
		var circleHorizIds = [];
		svg.append('rect')
				.attr('class', sliderClass + " " + mySVGClass)
				.attr('id', handleId)
				.attr('x', handleX)
				.attr('y', handleY)
				.attr('rx', 8)
				.attr('height', handleHeight)
				.attr('width', handleWidth)
				.attr('fill', 'lightsteelblue')
				.attr('cursor', 'pointer')
				.call(dragSlider);

		function dragstarted(event){
			var whichSlider = "." + d3.select(this).attr('class').replace(" ", ".");
			d3.selectAll(whichSlider).raise().attr('fill', 'steelblue');
		}
		function draggedVert(event){
			
			var whichSlider = d3.select(this).attr('id').split('Handle')[0];
			if (whichSlider.includes('vert')){
				//Prevent slider from going off screen left
				if (event.x < margin.left){
					d3.select("#" + whichSlider + "Bar").attr('x', margin.left);
					d3.select("#" + whichSlider + "Handle").attr('x', margin.left-2);	
				}
				// Prevent slider from going off screen right 
				else if (event.x > width-margin.right) {
					d3.select("#" + whichSlider + "Bar").attr('x', width-margin.right);
					d3.select("#" + whichSlider + "Handle").attr('x', width-margin.right-2);
				} else{
					d3.select("#" + whichSlider + "Bar").attr('x', event.x);
					d3.select("#" + whichSlider + "Handle").attr('x', event.x-2);
				}
			} else {
				//Prevent slider from going off the bottom
				if (event.y > (height - margin.bottom)) {
					d3.select("#" + whichSlider + "Bar").attr('y', height-margin.bottom);
					d3.select("#" + whichSlider + "Handle").attr('y', height-margin.bottom-2);
				} 
				//Prevent slider from going off the top
				else if (event.y < margin.top){
					d3.select("#" + whichSlider + "Bar").attr('y', margin.top);
					d3.select("#" + whichSlider + "Handle").attr('y', margin.top-2);
				}
				else {		
					d3.select("#" + whichSlider + "Bar").attr('y', event.y);
					d3.select("#" + whichSlider + "Handle").attr('y', event.y-2);
				}
			}
			
			const circles = d3.selectAll('circle.' + mySVGClass).nodes();
			var circleDataArray = [];
			circles.forEach(element => {
				switch(mySVGClass) {
					case 'horizGraph':
						curr_y = element.cy.baseVal.value;
						if ((curr_y >= (event.y-radius)) && (curr_y <= (event.y+radius+slider.bar))) {
							element.setAttribute('r', radius * 2);
							var circleData = d3.select(element).datum();
							circleDataArray.push(circleData);
						}
						else {
							element.setAttribute('r', radius);
						}
						break;
					case 'vertGraph':
						curr_x = element.cx.baseVal.value;
						if ((curr_x >= event.x-radius) && (curr_x <= (event.x+radius+slider.bar))) {
							element.setAttribute('r', radius * 2);
							var circleData = d3.select(element).datum();
							circleDataArray.push(circleData);
						}
						else {
							element.setAttribute('r', radius);
						}
						break;
				}
				
			});
			toolTipAppear(event, d, whichSlider, circleDataArray);
		}
		
		function dragend(event, d){
			var whichSlider = "." + d3.select(this).attr('class').replace(' ', '.');
			d3.selectAll(whichSlider).raise().attr('fill', 'lightsteelblue');
		}

		function toolTipAppear(event, d, whichSlider, selectedCircles){

			var text = whichSlider.includes("horiz") ? toolTipText.horizTextSameSide : toolTipText.vertText;

			toolTipG.selectAll('text').remove();
			toolTipG.select("rect")
			.transition()
			.duration(35)
			.attr('width', whichSlider.includes("horiz") ? 219 : 225)
			.attr('height', whichSlider.includes("horiz") ? 65 : 65)
		
			//Get the selected circles' data
			if (selectedCircles.length == 2 && whichSlider.includes("horiz")) {
				var blackPatientScore = selectedCircles[0].risk_score_quantile;
				var whitePatientScore = selectedCircles[1].risk_score_quantile;
				//If one patient is past the threshold but the other isn't
				if ((whichSlider.includes("horiz")) && (blackPatientScore <= 55) && (whitePatientScore >= 55)){
					text = toolTipText.horizTextAcrossThreshold;
				}
				var Y = selectedCircles[1].num_chronic_conds_mean.toFixed(2);
			
				text = text.replace("Y", Y);
			} 
			else if (whichSlider.includes("horiz")){

				//Need to use a LoBF point
				var blackApproxY = 0;
				var blackPatientScore = 0;
				var blackApproxIndex = -1;
				blackCurve.forEach((element,i) => {
					if (y(element[1]) > event.y) {
						blackApproxY = y(element[1]);
						blackPatientScore = element[0];
						blackApproxIndex = i;
					}
				});
				var whiteApproxY = 0;
				var whitePatientScore = 0;
				var whiteApproxIndex = -1;
				whiteCurve.forEach((element,i) => {
					if (y(element[1]) > event.y) {
						whiteApproxY = y(element[1]);
						whitePatientScore = element[0];
						whiteApproxIndex = i;
					}
				});
				//If one patient is past the threshold but the other isn't
				if ((blackPatientScore <= 55) && (whitePatientScore >= 55)) {
					text = toolTipText.horizTextAcrossThreshold;
				}

				var Y = blackCurve[blackApproxIndex][1].toFixed(2);
				text = text.replace("Y", Y);
			}
			if (selectedCircles.length == 2 && whichSlider.includes("vert")){
				var X = selectedCircles[1].risk_score_quantile;
				var Y = selectedCircles[1].num_chronic_conds_mean.toFixed(2);
				var Z = selectedCircles[0].num_chronic_conds_mean.toFixed(2);
				
				var diff = (Z - Y).toFixed(2);
				text = text.replace("X", X);
				text = text.replace("diff", diff);
			}
			else if (whichSlider.includes("vert")){
				//Need to use a LoBF point
				var blackApproxX = 0;
				var blackApproxIndex = -1;
				blackCurve.forEach((element,i) => {
					if (x(element[0]) < event.x) {
						blackApproxX = x(element[0]);
						blackApproxIndex = i;
					}
				});
				var whiteApproxX = 0;
				var whiteApproxIndex = -1;
				whiteCurve.forEach((element,i) => {
					if (x(element[0]) < event.x) {
						whiteApproxX = x(element[0]);
						whiteApproxIndex = i;
					}
				});
				var X = blackCurve[blackApproxIndex][0].toFixed(0);
				var Y = whiteCurve[whiteApproxIndex][1].toFixed(2);
				var Z = blackCurve[blackApproxIndex][1].toFixed(2);
				
				var diff = (Z - Y).toFixed(2);
				text = text.replace("X", X);
				text = text.replace("diff", diff);
			}


			var toolTipTextElement = toolTipG.selectAll('text')
					.data(d => text.split("\n"))
					.enter()
					.append("text")
					.attr('class', 'tiptext')
					.attr('x', 95) //(event.x - 170)
					.attr('y', 135) //(500 - event.x)
					.attr('font-size', 12);
				toolTipTextElement
					.append('tspan')
					.attr('class', 'tiptext')
					.text(d => d)
					.attr('x',95)
					.attr('y', (d,i) => i * 15 + 135);
		}

		function showDotToolTip(event, d) {
			var whichLabel = "label" + d3.select(this).attr('id').split('circle')[1] + " " + mySVGClass;
			var allPartsOfDotToolTip = document.getElementsByClassName(whichLabel);
			
			for (var i = 0; i<allPartsOfDotToolTip.length; i++) {
				allPartsOfDotToolTip[i].setAttribute("display", "inline");
			}
		}
		function hideDotToolTip(event, d) {
			d3.selectAll('.labels.' + mySVGClass).attr('display', 'none');
		}

	})
	.catch(function(error){
		console.log("Error on csv load");
		console.log(error)
	})

}

drawMySVG('#fig1AHoriz', 'horizGraph');

drawMySVG('#fig1AVert', 'vertGraph');











