import Switches from 'hvac-switch'

const debug = require('debug')('controller:hvac');

const hvac = {
  cool: async function() {
    debug('cool');

    Promise.all([Switches.fan.on(), Switches.heat.off(), Switches.cool.on()])
  },

  off: async function() {
    debug('off');
    Promise.all([Switches.fan.off(), Switches.cool.off(), Switches.heat.off()])
  },

  heat: async function () {
    Promise.all([Switches.fan.on(), Switches.heat.on(), Switches.cool.off()])
  },
  
  fan: async function () {
    Promise.all([Switches.fan.on(), Switches.heat.off(), Switches.cool.off()])
  }

  identify: function () {
    debug('identify');
  },
  
  active: function(value) {
    this.activeState = value     
  },

  active: function(value) {
    return this.activeState
  },
};

export default door;
