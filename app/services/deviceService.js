const deviceRepository = require('../repositories/deviceRepository');

class DeviceService {
   

    // add device 
    async addDevice(deviceData) {
        return deviceRepository.create(deviceData);
    }

    async getAllDevices() {
        return deviceRepository.findAll();
    }

    




    // --- Service Logic for Devices ---
    async getDeviceByIp(ipAddress) {
        // Service method to retrieve device details by IP address
        return this.deviceRepository.findDeviceByIp(ipAddress);
    }

    async getDeviceNameByIp(ipAddress) {
        // Service method to retrieve device name by IP address
        const device = await deviceRepository.findDeviceByIp(ipAddress);
        return device ? device.deviceName : null;
    }
}

module.exports = new DeviceService();