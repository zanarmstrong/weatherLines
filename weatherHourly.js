"use strict";

// Data location

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
                       {normalTemperature: [-10,105], heatIndex: [-10,105], windChill: [-10,105], cloudCover: [0,100], aveWindSpeed: [0,25]},
                       {width: width, height: height},
                       legendRectHeight);


if(window.location.hash.split("&").length != 0){
  var windowState = window.location.hash.split("&");
  for(var i = 0; i < windowState.length; i++){
    var k = windowState[i].replace('#','').split('=');
    if(k[0] == "city"){
      cState.setCity(k[1]);
    } else if (k[0] == "metric"){
      cState.setMetric(k[1]);
    } 
  }
}

var dataFile = 'dataMunging/' + cState.getCity() + '.csv';
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
  cState.updateHash();

  // draw lines
  viz.setView(cState, data.getPathData(cState.getCity(), cState.getMetric()), data.getInputDataCity(cState.getCity()));
  setUpMap();

});

// ----- helper functions ----- // 
// update selected city
function updateCity(city) {
    cState.setCity(city);
    dataFile = 'dataMunging/' + city + '.csv';
    d3.csv(dataFile, function(error, inputData) {
      if (error) return console.error(error);
      // still can consolodate this
      updateCities(city);
      data.updateData(inputData, cState);
      updateDataAndView();
    }
    )
}

// update data and view
function updateDataAndView() {
  data.updateState(cState);
  viz.updateView(cState, data.getPathData(cState.getCity(), cState.getMetric()), data.getInputDataCity(cState.getCity()));
}
