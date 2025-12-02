// src/repositories/Table.repository.js

const BaseRepository = require('./baseRepository');
const TableModel = require('../models/table'); // Assuming path to your Table model

class TableRepository extends BaseRepository {
    constructor() {
        super(TableModel); // Inherits CRUD methods for the Table model
    }

    // --- Custom Logic for Tables ---

    async findTableByIp(ipAddress) {
        // CRITICAL: Used by middleware/service to identify the originating table
        return this.model.findOne({ ipAddress: ipAddress })
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

module.exports = TableRepository;