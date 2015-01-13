"use strict";

// Data location
var dataFile = "moreCities.csv";

// STANDARD VARIABLES
var margin = {
    top: 120,
    right: 250,
    bottom: 60,
    left: 100
  },
  width = 1200 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

// other variables
var legendRectHeight = 13,
    clockPosition = {x: width - 60, y: 60},
    clockHours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// initialize state
var cState = new state('SAN FRANCISCO', 
                       "cloudCover", 
                       {normalTemperature: [-5,105], heatIndex: [-5,105], windChill: [-5,105], cloudCover: [0,100], aveWindSpeed: [0,25]},
                       {width: width, height: height},
                       legendRectHeight);

// initialize data
var data = new dataObj();

// STANDARD SVG SETUP
var svg = d3.select('#weatherLines')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// initialize view
var viz = new view();

// when metric changes, update data and view
d3.select('#metric')
  .on("change", function() {
    console.log(this.value)
    cState.setMetric(this.value);
    updateDataAndView();
  })

// -----------------------------
// READ IN DATA AND DRAW GRAPH
// -----------------------------
d3.csv(dataFile, function(error, inputData) {
  if (error) return console.error(error);

  // transform data to useable format (better way to do this?)
  data.updateData(inputData, cState);

  // draw lines 
  viz.setView(cState, data.getPathData(), data.getFilteredData());
  setUpMap();

});

// ----- helper functions ----- // 
// update selected city
function updateCity(city) {
    cState.setCity(city);
    updateCities(city);
    updateDataAndView();
}

// update data and view
function updateDataAndView() {
  data.updateState(cState);
  viz.updateView(cState, data.getPathData(), data.getFilteredData());
}
