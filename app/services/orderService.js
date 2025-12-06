const mongoose = require('mongoose'); // Import mongoose for session management
const OrderRepository = require('../repositories/orderRepository');
const ProductRepository = require('../repositories/productRepository');
const TableRepository = require('../repositories/tableRepository');
const DeviceRepository = require('../repositories/deviceRepository');   
const { ObjectId } = mongoose.Types; // Use ObjectId from mongoose

class OrderService {
  
   
   /**
     * Helper Function: Calculates Total Price and Snapshots Item Details.
     * Ensures strict BSON types and strips unauthorized fields.
     */
    async calculateOrderTotalAndSanitize(items) {
        let totalAmount = 0;
        const sanitizedItems = [];
        const productIds = items.map(item => item.productId.toString());

        // Using direct repository call
        const products = await ProductRepository.findAll({ _id: { $in: productIds }, isAvailable: true });
        
        if (products.length !== productIds.length) {
            throw new Error('One or more products are unavailable or do not exist.');
        }

        const productMap = new Map(products.map(p => [p._id.toString(), p]));

        for (const item of items) {
            const product = productMap.get(item.productId.toString()); 
            if (!product) continue;

            const priceAtOrder = product.price;
            const itemTotal = priceAtOrder * item.quantity;
            totalAmount += itemTotal; // Use unrounded total for aggregation initially

            // FIX: Re-introducing the required 'name' field for the OrderItemSchema 
            // since both Mongoose and the MongoDB $jsonSchema require it.
            sanitizedItems.push({
                product: new ObjectId(item.productId), 
                name: product.name, // <-- Necessary for OrderItemSchema
                // Explicitly cast to integer
                quantity: parseInt(item.quantity, 10), 
                // Explicitly cast to float/double, ensuring no floating point issues
                priceAtOrder: parseFloat(priceAtOrder.toFixed(2)), 
                customizations: Array.isArray(item.customizations) ? item.customizations : []
            });
        }
        
        // Finalize total amount calculation by rounding to 2 decimal places
        totalAmount = parseFloat(totalAmount.toFixed(2));

        return { totalAmount, sanitizedItems };
    }
    // --- Back Office Dashboard Methods (Now calling Repository methods) ---

    /**
     * Retrieves recent orders for the staff dashboard view.
     */
    async getDashboardOrders() {
        const populateOptions = ['client', 'table'];
        const limit = 50;
        const sort = { createdAt: -1 };
        
        return OrderRepository.findWithPopulationAndLimit(
            {}, 
            populateOptions, 
            limit, 
            sort
        );
    }
    
    /**
     * Retrieves full details for a single order.
     * @param {string} orderId 
     */
    async getOrderById(orderId) {
        const populateOptions = ['client', 'table', 'items.product'];

        const order = await OrderRepository.findByIdWithPopulation(
            orderId,
            populateOptions
        );
            
        if (!order) {
            throw new Error('Order not found.');
        }
        return order;
    }
   /**
     * Creates a new order and updates the table status using a Mongoose Transaction.
     * @param {string} tableIp - IP address from the client request (e.g., "::1").
     * @param {array} items - Array of order items.
     * @param {string} userId - Optional User ID.
     */
    async createNewOrder(tableIp, items, userId = null) {
        
        // 1. Find the Device associated with the incoming IP address
        const device = await DeviceRepository.findDeviceByIp(tableIp);

        if (!device) {
            throw new Error(`Device not found for IP: ${tableIp}. Order cannot be placed.`);
        }
        
        // 2. Find the Table that references this Device ID
        const table = await TableRepository.findTableByDeviceId(device._id);

        if (!table) {
            throw new Error(`Table not configured for device ID: ${device._id}. Order cannot be placed.`);
        }
        
        // // 3. Status check: Only allow new orders on Vacant tables (currentOrder should be null)
        // if (table.currentOrder) {
        //     throw new Error('Table is currently occupied with an open order. Use an update endpoint to add items.');
        // }
        
        // 4. Apply Business Logic: Calculate Total and Snapshot Prices
        const { totalAmount, sanitizedItems } = await this.calculateOrderTotalAndSanitize(items);
        
        // 5. Construct the final order document
        const orderData = {
            table: new ObjectId(table._id), 
            // The Mongoose schema uses 'client', resolving the native MongoDB conflict.
            client: userId ? new ObjectId(userId) : null, 
            items: sanitizedItems,
            totalAmount: totalAmount,
            status: 'Pending',
            paymentDetails: { 
                method: 'None', 
                status: 'Unpaid' 
            }
        };

        // 6. Implement Mongoose Transaction for Atomicity
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // A. Save the order document within the transaction
            const newOrder = await OrderRepository.create(orderData, { session });
            
            // B. Update Table Status and reference the new order ID within the transaction
            await TableRepository.updateTableStatusAndOrder(
                new ObjectId(table._id), 
                'Occupied', 
                newOrder._id,
                { session } // Pass session to ensure atomicity
            );

            // C. Commit the transaction if both operations succeeded
            await session.commitTransaction();
            return newOrder;

        } catch (error) {
            // D. Abort the transaction if any operation failed
            await session.abortTransaction();
            
            let detailedErrorMessage = 'Unknown validation error.';
            
            // Detailed Mongoose Validation Error Inspection
            if (error.name === 'ValidationError') {
                detailedErrorMessage = 'Mongoose Validation Errors:\n';
                for (const field in error.errors) {
                    const validationError = error.errors[field];
                    detailedErrorMessage += `- Path: ${validationError.path}, Kind: ${validationError.kind}, Message: ${validationError.message}\n`;
                }
            } else if (error.code === 121) {
                 // MongoDB Schema Validation Failure (if defined directly on the collection)
                 detailedErrorMessage = 'MongoDB Schema Validation Failed (Error Code 121). Details:\n';
                 
                 // CRITICAL INSTRUCTION: If you encounter error.code 121 (additionalProperties), 
                 // you MUST add `versionKey: false` to the OrderSchema definition in the Mongoose model 
                 // file (`models/Order.js`) to prevent Mongoose from adding the unauthorized `__v` field.
                 
                 // Explicitly parse the schemaRulesNotSatisfied array
                 const validationDetails = error.errInfo?.details;
                 
                 if (validationDetails && Array.isArray(validationDetails.schemaRulesNotSatisfied)) {
                    validationDetails.schemaRulesNotSatisfied.forEach((rule, index) => {
                        // Log the specific field/path and rule that was violated
                        detailedErrorMessage += `Violation ${index + 1}:\n`;
                        detailedErrorMessage += `  - Path: ${rule.failingPath || 'N/A'}\n`;
                        detailedErrorMessage += `  - Rule: ${rule.specifiedRule || 'N/A'}\n`;
                        detailedErrorMessage += `  - Operator: ${rule.operatorName || 'N/A'}\n`;
                        
                        // Log the failing Document for the violation if available
                        if (rule.failingDocument) {
                            detailedErrorMessage += `  - Failing Document Snippet: ${JSON.stringify(rule.failingDocument).substring(0, 100)}...\n`;
                        }
                    });
                 } else {
                     detailedErrorMessage += 'Could not parse detailed validation rules from error structure.';
                 }
            }

            console.error('Transaction failed, rolled back:', detailedErrorMessage);
            throw new Error('Front Office Order Creation Error: Document failed validation.');

        } finally {
            // E. Always end the session
            await session.endSession();
        }
    }


   /**
     * Updates the status of an order.
     */
    async updateOrderStatus(orderId, newStatus) {
        const validStatuses = ['Pending', 'Processing', 'Ready', 'Served', 'Waiting Payment', 'Paid', 'Cancelled'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error('Invalid status update requested.');
        }

        // Use class instance: this.orderRepository
        const updatedOrder = await OrderRepository.updateStatus(orderId, newStatus);
        if (!updatedOrder) {
            throw new Error('Order not found.');
        }

        if (newStatus === 'Paid' || newStatus === 'Cancelled') {
            // Use class instance: this.tableRepository
            await TableRepository.updateTableStatusAndOrder(updatedOrder.table, 'Needs Cleaning', null);
        }

        return updatedOrder;
    }

/**
     * Deletes an order (used by Admin/Manager) and cleans up related table state.
     */
    async deleteOrder(orderId) {
        const order = await OrderRepository.findById(orderId);
        if (!order) {
            throw new Error('Order not found.');
        }

        if (order.status !== 'Pending' && order.status !== 'Cancelled') {
            throw new Error('Cannot delete an active or completed order. Please cancel it first.');
        }
        
        const deletedOrder = await OrderRepository.deleteById(orderId);
        
        if (order.table) {
            // Reset the table to vacant and remove currentOrder reference
            await TableRepository.updateTableStatusAndOrder(order.table, 'Vacant', null);
        }
        
        return deletedOrder;
    }
}

module.exports = OrderService;