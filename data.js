/////////////////////////////
//  Manage Data
/////////////////////////////
function dataObj() {
  this.inputData = {};
  this.pathData = [];
};

dataObj.prototype.updateData = function(data, state) {
  city = state.getCity();
  if(this.inputData[city] == undefined){
    this.inputData[city] = data;
  }

  this.updateState(state)

}

dataObj.prototype.updateState = function(state) {
  self = this;

  for (var i = 0; i < 24; i++) {
    this.pathData[i] = [];
  };

  this.inputData[state.getCity()].forEach(function(d,i){
    // todo: remove moment here (prep in python instead?)
    self.pathData[+d.hour][moment(d.day).dayOfYear() - 1] = d[state.getMetric()] / 10;
  })

}

dataObj.prototype.getInputData = function(){
  return this.inputData;
}

dataObj.prototype.getInputDataCity = function(city){
  return this.inputData[city];
}

dataObj.prototype.getPathData = function(){
  return this.pathData;
}
