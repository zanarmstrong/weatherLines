/////////////////////////////
//  Manage Data
/////////////////////////////
function dataObj() {
  this.inputData = {};
  this.filteredData = {};
  this.pathData = [];
};

dataObj.prototype.updateData = function(data, state) {
  this.inputData = data;
  self = this;

  for (var i = 0; i < 24; i++) {
    this.pathData[i] = [];
  };
  this.filteredData = this.inputData
                          .filter(function(d,i) {
                              if (d.city == state.getCity()) {
                                self.pathData[+d.hour][moment(d.day).dayOfYear() - 1] = d[state.getMetric()];
                                return d;
                          }});
}

dataObj.prototype.updateState = function(state) {
  self = this;

  for (var i = 0; i < 24; i++) {
    this.pathData[i] = [];
  };

  this.filteredData = this.inputData
                          .filter(function(d,i) {
                              if (d.city == state.getCity()) {
                                self.pathData[+d.hour][moment(d.day).dayOfYear() - 1] = d[state.getMetric()];
                                return d;
                          }});
}

dataObj.prototype.getInputData = function(){
  return this.inputData;
}

dataObj.prototype.getPathData = function(){
  return this.pathData;
}

dataObj.prototype.getFilteredData = function(){
  return this.filteredData;
}
