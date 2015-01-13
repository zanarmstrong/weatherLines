"use strict";

function state(city, metric, yDomain, dimensions, legendRectHeight) {
	this.city = city;
	this.metric = metric;
	this.yDomain = yDomain;
	this.selectedHours= [];
	this.dimensions = dimensions;
	this.scales = {
		// x axis
		x: d3.scale.linear().domain([0, 365]).range([0, dimensions.width]),
		// y axis
		y: d3.scale.linear().domain(this.yDomain[this.metric]).range([dimensions.height, 0]),
		// color for hours 0-23
		color: d3.scale.linear().domain([0, 6, 12, 18, 23]).range(["#0A4D94", "#87B5E6", "#FFC639", "#9F8DE9", "#2C109D"]),
		// x axis formatted for tick marks
		xTime: d3.time.scale().domain([moment("2010-01-01"), moment("2010-12-31")]).range([0, dimensions.width]),
		// for hour legend on right
		legendY: d3.scale.linear().domain([0, 23]).range([dimensions.height / 2 + legendRectHeight * 12 + 30, dimensions.height / 2 - legendRectHeight * 12 + 30])
	};
};

state.prototype.setCity = function(city) {
	this.city = city;
};

state.prototype.getCity = function() {
	return this.city;
};

state.prototype.setMetric = function(metric) {
	this.metric = metric;
	this.scales.y.domain(this.yDomain[this.metric]);
};

state.prototype.getMetric = function() {
	return this.metric;
};

state.prototype.getScales = function(){
	return this.scales;
}

state.prototype.updateSelectedHourList = function(hour) {
  if (this.selectedHours.indexOf(hour) == -1) {
    this.selectedHours.push(hour)
  } else {
    this.selectedHours.splice(this.selectedHours.indexOf(hour), 1);
  }
}

state.prototype.getSelectedHours = function() {
	return this.selectedHours;
}

state.prototype.getTitle = function(){
	var metric = "";
	if(this.metric == "normalTemperature"){
		metric = "Normal Temperature";
	} else if (this.metric == "cloudCover"){
		metric = "Percent of Cloud Cover ";
	} else if (this.metric == "heatIndex"){
		metric = "Heat Index (what temperature it feels like due to humidity) ";
	} else if (this.metric == "windChill"){
		metric = "Wind Chill (what temperature it feels like due to wind) ";
	} else if (this.metric == "aveWindSpeed"){
		metric = "Average Wind Speed ";
	} 
	return metric + " in " + this.city + " by hour of day, based on last 30 years";;
}

state.prototype.getYText = function(){
	if(["normalTemperature", "heatIndex", "windChill"].indexOf(this.metric) != -1){
		return "°F";
	} else if (this.metric == "cloudCover"){
		return "%";
	} else if (this.metric == "aveWindSpeed"){
		return "mph";
	} else {
		return "";
	}
}

state.prototype.getYTextAxis = function(){
	if(this.metric == "normalTemperature"){
		return "Typical Temperature (°F)";
	} else if (this.metric == "cloudCover"){
		return "Typical Cloud Cover, as % of sky";
	} else if (this.metric == "headIndex"){
		return "Apparent Temperature, taking into account humidity (°F)";
	} else if (this.metric == "windChill"){
		return "Apparent Temperature, taking into account wind (°F)";
	} else if (this.metric == "aveWindSpeed"){
		return "Average Wind Speed, in mph";
	} else {
		return "";
	}
}

state.prototype.showCrosshairs = function(bool){
	d3.select(".crosshairs").classed("hidden", !bool);
}
