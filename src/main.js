import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import storage from 'node-persist';
import doorController from './door';
import hvacController from './hvac';
import config from '../config.json';
import Camera from './camera';
const debug = require('debug')('controller:main');

storage.initSync();

debug(`accessory name: ${config.hvac.accessory.name}`);
debug(`accessory username: ${config.hvac.accessory.username}`);
debug(`accessory pincode: ${config.hvac.accessory.pincode}`);
debug(`accessory port: ${config.hvac.accessory.port}`);


async function controller() {
  const hvacUUID = uuid.generate(`hap-nodejs:accessories:${config.hvac.accessory.name}`);
  const hvacAccessory = exports.accessory = new Accessory(config.hvac.accessory.name, hvacUUID);

  // HVAC Accessory
  hvacAccessory
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, 'Anthony Moralez')
    .setCharacteristic(Characteristic.Model, 'HVAC-0.1')
    .setCharacteristic(Characteristic.SerialNumber, '7');

  hvacAccessory.on('identify', function(paired, callback) {
    hvacController.identify();
    callback();
  });

  hvacAccessory
    .addService(Service.Fan, 'Fan')
    .setCharacteristic(Characteristic.On)
      .on('set', function(value, callback) {
        if (value) {
          await hvacController.fan()
        } else {
          await hvacController.off()
        }
      })
  heatCool = hvacAccessory.addService(Service.HeaterCooler)
  heatCool
    .getCharacteristic(Characteristic.Active)
    .on('set', function(value, callback) {
      debug('active set to ${value}')
      hvacController.active(value)
      callback()
    })
    .on('get', function(callback) {
      callback(null, hvacController.getActive()|| Characteristic.Active.Inactive)
    })

  heatCool
    .getCharacteristic(Characteristic.CurrentHeaterCoolerState)
    .on('get', function(callback) {
      callback(null, hvacController.currentState()||Characteristic.CurrentHeaterCoolerState.INACTIVE)
    })

  heatCool
    .getCharacteristic(Characteristic.TargetHeaterCoolerState)
    .on('set', function(value, callback) {
      if (value == CurrentHeaterCoolerState.AUTO || value == CurrentHeaterCoolerState.COOL) {
        hvacController.cool().catch(callback)
      } else {
        hvacController.heat().catch(callback)
      }
      hvacController.currentState = value
      callback()
    })

  heatCool
    .getCharacteristic(Characteristic.CurrentTemperature)
    .on('get', function(callback) {
      callback(23.0)
    });
}

controller();
