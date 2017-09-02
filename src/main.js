import { Accessory, Service, Characteristic, uuid } from 'hap-nodejs';
import storage from 'node-persist';
import doorController from './door';
import config from '../config.json';
import Camera from './camera';
const debug = require('debug')('controller:main');

storage.initSync();

debug(`accessory name: ${config.door.accessory.name}`);
debug(`accessory username: ${config.door.accessory.username}`);
debug(`accessory pincode: ${config.door.accessory.pincode}`);
debug(`accessory port: ${config.door.accessory.port}`);

debug(`accessory name: ${config.hvac.accessory.name}`);
debug(`accessory username: ${config.hvac.accessory.username}`);
debug(`accessory pincode: ${config.hvac.accessory.pincode}`);
debug(`accessory port: ${config.hvac.accessory.port}`);


async function controller() {
  const doorUUID = uuid.generate(`hap-nodejs:accessories:${config.door.accessory.name}`);
  const doorAccessory = exports.accessory = new Accessory(config.door.accessory.name, doorUUID);
  const hvacUUID = uuid.generate(`hap-nodejs:accessories:${config.hvac.accessory.name}`);
  const hvacAccessory = exports.accessory = new Accessory(config.hvac.accessory.name, hvacUUID);


  // Door Accessory

  doorAccessory
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, 'Manufacturer')
    .setCharacteristic(Characteristic.Model, 'Model')
    .setCharacteristic(Characteristic.SerialNumber, 'Serial Number');

  doorAccessory.on('identify', function (paired, callback) {
    doorController.identify();

    callback();
  });

  const doorState = () => doorController.isDoorOpened()
    ? Characteristic.TargetDoorState.OPEN
    : Characteristic.TargetDoorState.CLOSED;

  const initialDoorState = await doorState();

  debug('initial door state', initialDoorState);

  doorAccessory
    .addService(Service.GarageDoorOpener, 'Garage Door')
    .setCharacteristic(Characteristic.TargetDoorState, initialDoorState)
    .getCharacteristic(Characteristic.TargetDoorState)
    .on('set', async function(value, callback) {

      if (value == Characteristic.TargetDoorState.CLOSED) {
        doorAccessory
          .getService(Service.GarageDoorOpener)
          .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSING);

        callback();

        await doorController.openDoor();

        const doorState = await doorState();


        doorAccessory
          .getService(Service.GarageDoorOpener)
          .setCharacteristic(Characteristic.CurrentDoorState, doorStaet);
      }
      else if (value == Characteristic.TargetDoorState.OPEN) {
        doorAccessory
          .getService(Service.GarageDoorOpener)
          .setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPENING);

        callback();

        await doorController.closeDoor();

        const doorState = await doorState();

        doorAccessory
          .getService(Service.GarageDoorOpener)
          .setCharacteristic(Characteristic.CurrentDoorState, doorState);
      }
    });


  doorAccessory
    .getService(Service.GarageDoorOpener)
    .getCharacteristic(Characteristic.CurrentDoorState)
    .on('get', async function(callback) {

      let err = null;

      if (await doorController.isDoorOpened()) {
        debug('door is open');
        callback(err, Characteristic.CurrentDoorState.OPEN);
      } else {
        debug('door is closed');
        callback(err, Characteristic.CurrentDoorState.CLOSED);
      }
    });

}

controller();
