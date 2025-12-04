const deviceModel = require('../models/device');
const BaseRepository = require('./baseRepository');


class DeviceRepository extends BaseRepository {
    constructor() {
        super(deviceModel); // Inherits CRUD methods for the Device model
    }
    // --- Custom Logic for Devices ---
    async findDeviceByIp(ipAddress) {
        // Method to find a device by its IP address
        return this.model.findOne({ ipAddress: ipAddress }).exec();
    }
}

module.exports = new DeviceRepository;