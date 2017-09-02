import gpio from 'rpi-gpio';
import config from '../config.json';
const debug = require('debug')('controller:switch');

const fanPin = config.hvac.pins.fan;
const coolPin = config.hvac.pins.cool;
const heatPin = config.hvac.pins.heat;

gpio.setMode(gpio.MODE_RPI);

const timeout = async (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const switchOn = async (pin) => {
  try {
    // initial unexport the pin
    debug(`unexport GPIO pin ${pin}`);
    const initialUnexportError = await gpio.unexportPin(pin);
  } catch (errors) {
    // do nothing
  }

  try {
    // setup
    debug(`setup GPIO pin ${pin}`);
    const setupError = await gpio.setup(pin, gpio.DIR_OUT);

    // toggle on
    debug('toggle button on');
    const toggleOnError = await gpio.write(pin, 1);
  } catch (errors) {
    console.error(errors);
    debug(`unexport GPIO pin ${pin}`);
    const unexportError = await gpio.unexportPin(pin);
  }
}

const switchOff = async (pin) => {
  try {
    // toggle off
    debug('toggle button off');
    const toggleOffError = await gpio.write(pin, 0);

    // unexport the pin
    debug(`unexport GPIO pin ${pin}`);
    const unexportError = await gpio.unexportPin(pin);
  } catch (errors) {
    console.error(errors);
    debug(`unexport GPIO pin ${pin}`);
    const unexportError = await gpio.unexportPin(pin);
  }
}


const toggle = async (pin) => {
  try {
    await switchOn(pin)
    await swithOff(pin)
  } catch (errors) {
    console.error(errors);
    debug(`unexport GPIO pin ${pin}`);
    const unexportError = await gpio.unexportPin(pin);
  }
}

const fan = {
  on: async () => {
       switchOn(fanPin)
  },
  off: async () => {
       switchOff(fanPin)
  }
}
 
const heat = {
  on: async () => {
       switchOn(heatPin)
  },
  off: async () => {
       switchOff(heatPin)
  }
}

const cool = {
  on: async () => {
       switchOn(coolPin)
  },
  off: async () => {
       switchOff(coolPin)
  }
}

export default { fan, heat, cool }

