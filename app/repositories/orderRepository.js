// src/repositories/Order.repository.js

const BaseRepository = require('./Base.repository');
const OrderModel = require('../models/order');

class OrderRepository extends BaseRepository {
    constructor() {
        super(OrderModel);
    }

    // --- Custom Logic for Orders ---

    async findPendingKitchenOrders() {
        // Method for the Back Office (Kitchen View)
        return this.model.find({
            status: { $in: ['Pending', 'Processing'] }
        })
        .populate('table', 'tableNumber') // Kitchen needs to know the table number
        .sort({ createdAt: 1 }) // Show oldest orders first
        .exec();
    }

    async updateStatus(orderId, newStatus) {
        // Method used by staff to move orders through the workflow
        return this.model.findByIdAndUpdate(
            orderId,
            { status: newStatus },
            { new: true }
        );
    }

    async findCurrentTableOrder(tableId) {
        // Method used by Service Layer to retrieve the open order for a tablet
        return this.model.findOne({
            table: tableId,
            status: { $nin: ['Paid', 'Cancelled'] } // Status is not final
        })
        .populate('items.product', 'name price') // Populate item details if needed
        .exec();
    }
}

module.exports = OrderRepository;