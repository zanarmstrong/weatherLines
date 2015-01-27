/////////////////////////////
//  Manage Data
/////////////////////////////
function dataObj() {
  this.inputData = {};
  this.pathData = {};
};

dataObj.prototype.updateData = function(data, state) {
  city = state.getCity();
  if(this.inputData[city] == undefined){
    this.inputData[city] = data;
    this.pathData[city] = {"normalTemperature": [], "cloudCover": [], "heatIndex": [], "windChill": [], "aveWindSpeed": [] }
  }

  this.updateState(state);

}

dataObj.prototype.updateState = function(state) {
  self = this;

  if(this.pathData[state.getCity()][state.getMetric()].length == 0){
    console.log("here")
    for (var i = 0; i < 24; i++) {
      this.pathData[state.getCity()][state.getMetric()][i] = [];
    };
  }
  this.inputData[state.getCity()].forEach(function(d,i){
    self.pathData[state.getCity()][state.getMetric()][+d.hour][d.day - 1] = d[state.getMetric()] / 10;
  })
}

dataObj.prototype.getInputData = function(){
  return this.inputData;
}

// do I use this?
dataObj.prototype.getInputDataCity = function(city){
  return this.inputData[city];
}

dataObj.prototype.getPathData = function(city, metric){
  return this.pathData[city][metric];
}
