const deviceModel = require('../models/device');
const BaseRepository = require('./baseRepository');


class DeviceRepository extends BaseRepository {
    constructor() {
        super(deviceModel); // Inherits CRUD methods for the Device model
    }
 /**
      * Finds a Device by its IP address string.
      * @param {string} ipString - The IP address string (e.g., "::1", "192.168.1.100").
      * @returns {Promise<Device>}
      */
    async findDeviceByIp(ipString) {
        // FIX: Querying the correct field name 'ipAddress' as defined in the schema
        return this.model.findOne({ ipAddress: ipString })
                         .exec();
    }
}

module.exports = new DeviceRepository;