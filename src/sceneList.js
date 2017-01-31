let sceneList = {
  scenes: {},
  addScene: function(name, func){
    this.scenes[name] = func;
  },
  getScene: function(name){
    return this.scenes[name];
  }
}


module.exports = sceneList;
