"use strict";

///////////////////////////
// view objects
///////////////////////////
function view() {
	this.setUpDot();
	this.setUpCrosshairs();
	this.voronoi = {};
};

view.prototype.setView = function(state, data, filteredData) {
  this.drawLines(state, data);
  this.drawAxis(state);
  this.drawTitle(state);
  this.drawLegend(cState);
  this.drawClock();

  this.voronoi = d3.geom.voronoi()
             		.x(function(d) {
              			return state.getScales().xTime(moment(d.day));
            		})
            		.y(function(d) {
              			return state.getScales().y(d[state.getMetric()] / 10);
            		})
            		.clipExtent([[0, 0],[state.dimensions.width, state.dimensions.height]]);
  this.drawVoronoi(this.voronoi(filteredData), state);
}

view.prototype.updateView = function(state, data, filteredData) {
  this.updateLines(state, data);
  this.updateTitle(state);
  this.updateAxis(state);
  this.updateVoronoi(this.voronoi(filteredData));
};

// manage hour selections // 
view.prototype.updateSelectedHoursView = function(state) {
  var selectedHours = state.getSelectedHours();
  // check if selected line is already selected or not
  if (selectedHours.length == 0) {
    d3.selectAll(".hourlyLines").attr("opacity", 1).classed("selected", false);
    d3.selectAll(".legend rect").attr("opacity", .7).attr("width", 50);
    d3.selectAll(".legend text")
      .text(function(d, i) {if ([0, 6, 12, 18].indexOf(i) != -1) {return formatHours(i);}});
  } else {
    d3.selectAll(".hourlyLines")
      .attr("opacity", function(d, i) {
        if (selectedHours.indexOf(i) != -1) {
          return 1
        } else {
          return .4
        }
      })
      .classed('selected', function(d, i) {
        if (selectedHours.indexOf(i) != -1) {
          return true
        } else {
          return false
        }
      });

    d3.selectAll(".legend rect")
      .attr("opacity", function(d, i) {
        if (selectedHours.indexOf(i) != -1) {
          return 1
        } else {
          return .7
        }
      })
      .attr("width", function(d, i) {
        if (selectedHours.indexOf(i) != -1) {
          return 60
        } else {
          return 50
        }
      });

    d3.selectAll(".legend text")
      .text(function(d, i) {
        if (selectedHours.indexOf(i) != -1) {
          return formatHours(i);
        } else {
          return ""
        }
      })
  }
}

// voronoi for mouseovers // 
view.prototype.drawVoronoi = function(data, state) {
	var self = this;
	// define mouseover and mouseout functions
	function vMouseover(d) {
  		var xpos = state.getScales().xTime(moment(d.day));
  		var ypos = state.getScales().y(d[state.getMetric()] / 10)
  		var dot = svg.select(".dot").classed('hidden', false);

  		dot.attr("transform", "translate(" + (xpos - 2) + "," + (ypos) + ")");

		viz.setCrosshairs(xpos, ypos, d);
  		  state.showCrosshairs(true);
  	    self.activateClock(d.hour);
	}

	function vMouseout(d) {
  		svg.select('.dot').classed('hidden', true);
  		state.showCrosshairs(false);
  		self.resetClock();
	}

  var self = this;

  svg.append("g")
    .attr("class", "voronoi")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .call(definePathAndDatum)
    .on("mouseover", vMouseover)
    .on("mouseout", vMouseout)
    .on('click', function(d, i) {
      cState.updateSelectedHourList(+d.hour);
      self.updateSelectedHoursView(state);
    });
}

view.prototype.updateVoronoi = function(data) {
  svg.selectAll('.voronoi')
    .selectAll("path")
    .data(data).call(definePathAndDatum);
}

// dot to show selected point
view.prototype.setUpDot = function() {
	svg.append("g")
  		.attr("transform", "translate(-100,-100)")
  		.attr("class", "dot hidden")
  		.append("circle")
  		.attr("r", 2);
}

// title
view.prototype.drawTitle = function(state) {
  svg.append("text")
    .text(state.getTitle())
    .attr("x", width / 2)
    .attr("y", -20)
    .style('text-anchor', 'middle')
    .attr("class", "title");
}

view.prototype.updateTitle = function(state) {
  svg.select('.title').text(state.getTitle());
}
// ----- AXIS --------
view.prototype.drawAxis = function(state) {
  var xAxis = d3.svg.axis()
    .tickFormat(d3.time.format("%b"))
    .scale(state.getScales().xTime)
    .orient('bottom');

  var yAxis = d3.svg.axis()
    .scale(state.getScales().y)
    .orient('left');

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append('text')
    .attr('class', 'label')
    .attr('x', 10)
    .attr('y', -40)
    .attr("transform", "rotate(-90)")
    .text(state.getYTextAxis());

  // adjust text labels
  svg.selectAll('.x')
    .selectAll('text')
    .attr('transform', 'translate(' + width / 24 + ',0)')
}

view.prototype.updateAxis = function(state) {
  svg.select(".y")
     .call(d3.svg.axis().scale(state.getScales().y).orient('left'))

  svg.select(".label").text(state.getYTextAxis());
}


// ----- LINES -------
view.prototype.drawLines = function(state, data) {
  var lineFunction = d3.svg.line()
  		.x(function(d, i) {
    		return state.getScales().x(i);
  		})
  		.y(function(d) {
    		return state.getScales().y(d);
  		})
  		.interpolate('basis');

  // line graph
  svg.selectAll('path')
  	// need to improve this
    .data(data)
    .enter()
    .append('path')
    .attr("d", function(d) {
      return lineFunction(d)
    })
    .attr("stroke", function(d, i) {
      return state.getScales().color(i);
    })
    .attr("class", "hourlyLines");
}

view.prototype.updateLines = function(state, data) {
	var lineFunction = d3.svg.line()
  		.x(function(d, i) {
    		return state.getScales().x(i);
  		})
  		.y(function(d) {
    		return state.getScales().y(d);
  		})
  		.interpolate('basis');

	svg.selectAll('.hourlyLines').data(data)
    .attr("d", function(d) {
      return lineFunction(d)
    });
}


// -----------------------------
// set up crosshairs
// -----------------------------
view.prototype.setUpCrosshairs = function() {

  // set up hover cross-hairs
  var crosshairs = svg.append("g").attr("class", "crosshairs hidden");

  crosshairs.append("line")
    .attr({
      x1: 0,
      x2: width,
      y1: 0,
      y2: 0
    })
    .classed("xLine", true);

  crosshairs.append("line")
    .attr({
      x1: 0,
      x2: 0,
      y1: 0,
      y2: height
    })
    .classed("yLine", true);

  crosshairs.append("text")
    .attr("x", 10)
    .attr("y", 0)
    .classed("xText", true);

  crosshairs.append("text")
    .attr("x", 0)
    .attr("y", height - 10)
    .classed("yText", true);

  crosshairs.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .classed("zText", true);

}

view.prototype.setCrosshairs = function(xpos, ypos, d) {
  // move crosshairs
  d3.select(".xLine")
    .attr("y2", ypos)
    .attr("y1", ypos)
    .attr("x2", xpos)
  d3.select(".yLine").attr("x1", xpos).attr("x2", xpos).attr("y1", ypos);

  // show text for crosshairs
  d3.select(".crosshairs").select('.xText').text((d[cState.getMetric()]/10) + cState.getYText()).attr("y", ypos - 10);
  d3.select(".crosshairs").select('.zText').text(formatHours(d.hour)).attr("y", ypos - 10).attr("x", xpos + 8);
  d3.select(".crosshairs").select('.yText').text(moment(d.day).format("MMM DD")).attr("x", xpos + 8);
}

// ----- LEGEND -----
view.prototype.drawLegend = function(state) {
  var twentyFourHours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  var self = this;
  
  // colored rectangles for legend
  var legend = svg.append("g").attr("class", "legend");
  legend.selectAll('rect')
    .data(twentyFourHours)
    .enter()
    .append('rect')
    .attr('class', 'legend')
    .attr("x", width + margin.right / 2 - 25)
    .attr("y", function(d, i) {
      return state.getScales().legendY(i)
    })
    .attr("height", legendRectHeight + 1)
    .attr("width", 50)
    .attr("fill", function(d, i) {
      return state.getScales().color(i)
    })
    .attr("opacity", .7)
    .on('click', function(d, i) {
      state.updateSelectedHourList(i);
      self.updateSelectedHoursView(state);
    });

  // text labels for hours in legend, show only midnight, 6am, noon, and 6pm
  svg.select(".legend").selectAll('text')
    .data(twentyFourHours)
    .enter()
    .append('text')
    .attr('x', width + margin.right / 2 + 40)
    .attr('y', function(d, i) {
      return state.getScales().legendY(i) + legendRectHeight
    })
    .on('click', function(d, i) {
      state.updateSelectedHourList(i);
      sView.updateSelectedHoursView(state);
    })
    .text(function(d, i) {
      if ([0, 6, 12, 18].indexOf(i) != -1) {
        return formatHours(i);
      }
    });
}


// ----- CLOCK ------ // 

view.prototype.drawClock = function() {

  var hour = 0;
  var clock = svg.append("g").attr("class", "clock");


  var rotateAngle = 2 * Math.PI / 12 * hour;
  var rotate = {x: 30 * Math.sin(rotateAngle),
              y: -30 * Math.cos(rotateAngle)}

  clock.append("circle")
    .attr("stroke", "grey")
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .attr("r", 50)
    .attr("cx", clockPosition.x)
    .attr("cy", clockPosition.y)

  clock.append("circle")
    .attr("stroke", "none")
    .attr("fill", "grey")
    .attr("r", 2)
    .attr("cx", clockPosition.x)
    .attr("cy", clockPosition.y)

  clock.append("line")
    .attr("stroke", "grey")
    .attr("stroke-width", 2)
    .attr("x1", clockPosition.x)
    .attr("x2", clockPosition.x + rotate.x)
    .attr("y1", clockPosition.y)
    .attr("y2", clockPosition.y + rotate.y);

  clock.append('text').attr("class", "am partOfDay")
    .attr("fill", "grey")
    .attr("x", clockPosition.x - 50 - 13.5)
    .attr("y", clockPosition.y - 45)
    .text("AM")

  clock.append('text').attr("class", "pm partOfDay")
    .attr("fill", "grey")
    .attr("x", clockPosition.x + 50 - 13.5)
    .attr("y", clockPosition.y - 45)
    .text("PM")

  d3.select(".clock").selectAll(".clockHour").data(clockHours).enter().append('text')
    .attr("class", "clockHour")
    //   .attr("fill", function(d){if(hour == d){return "white"} else {return "grey"}})
    .attr("fill", "grey")
    .attr("font-size", 14)
    .attr("x", function(d) {
      if ([10, 11, 12].indexOf(d) == -1) {
        return clockPosition.x - 3.5
      } else {
        return clockPosition.x - 3.5 - 4
      }
    })
    .attr("y", clockPosition.y + 5)
    .attr("transform", function(d) {
      var rotateN = 360 / 12 * d;
      return "translate(" + (39 * Math.cos((rotateN - 90) * Math.PI / 180)) + "," + (39 * Math.sin((rotateN - 90) * Math.PI / 180)) + ")"
    })
    .text(function(d) {
      return d
    });

}

view.prototype.activateClock = function(hour) {

  var rotateAngle = 2 * Math.PI / 12 * hour;
  var rotate = {x: 30 * Math.sin(rotateAngle),
              y: -30 * Math.cos(rotateAngle)}

  var partOfDay = 'am'
  if (hour > 11) {
    hour = hour - 12;
    partOfDay = 'pm';
  }
  // AM vs PM
  d3.select("." + partOfDay).attr("fill", "white");

  // line

  d3.select(".clock")
    .select("line")
    .attr("stroke", "white")
    .attr("y2", clockPosition.y + rotate.y)
    .attr("x2", clockPosition.x + rotate.x)

  // time in text
  d3.selectAll(".clockHour").data(clockHours)
    .attr("fill", function(d) {
      if (hour == d % 12) {
        return "white"
      } else {
        return "grey"
      }
    });

}

view.prototype.resetClock = function() {
  d3.select(".clock").selectAll("text").attr("fill", "grey");
  d3.select(".clock").selectAll("line").attr("stroke", "grey")
}

// helper function for voronoi mouseovers
function definePathAndDatum(selection){
    selection.attr("d", function(d) {
      if(typeof(d) != 'undefined'){
		return "M" + d.join("L") + "Z"};
    })
    .datum(function(d) {
    	if(typeof(d) != 'undefined'){
			return d.point;
    }})
}

// helper function for formatting hours into normal readable
function formatHours(num) {
  if (num == 0) {
    return "midnight";
  } else if (num < 12) {
    return num + "am";
  } else if (num == 12) {
    return "noon";
  } else {
    return (num - 12) + "pm";
  }
}
