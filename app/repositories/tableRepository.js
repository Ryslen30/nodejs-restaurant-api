// src/repositories/Table.repository.js

const BaseRepository = require('./baseRepository');
const TableModel = require('../models/table'); // Assuming path to your Table model

class TableRepository extends BaseRepository {
    constructor() {
        super(TableModel); // Inherits CRUD methods for the Table model
    }

    
    /**
     * Finds a Table by the Device ID it is assigned to.
     * @param {mongoose.Types.ObjectId} deviceId - The ObjectId of the linked Device.
     * @returns {Promise<Table>}
     */
    async findTableByDeviceId(deviceId) {
        // The query now correctly uses an ObjectId against the reference field 'ipAddress'
        return this.model.findOne({ ipAddress: deviceId })
                         .exec();
    }

    async updateTableStatusAndOrder(tableId, newStatus, currentOrderId = null) {
        // Used when an order is created, completed, or the table is reset
        return this.model.findByIdAndUpdate(
            tableId,
            { 
                status: newStatus, 
                currentOrder: currentOrderId 
            },
            { new: true }
        );
    }

    
}

module.exports = new TableRepository;