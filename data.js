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
  city = state.getCity();
  metric = state.getMetric();


  if(this.pathData[city][metric].length == 0){
    for (var i = 0; i < 24; i++) {
      this.pathData[city][metric][i] = [];
    };
  }
  this.inputData[city].forEach(function(d,i){
    self.pathData[city][metric][+d.hour][d.day - 1] = d[metric] / 10;
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
