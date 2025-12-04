const OrderRepository = require('../repositories/orderRepository');
const ProductRepository = require('../repositories/productRepository');
const TableRepository = require('../repositories/tableRepository');

class OrderService {
  

    // --- Helper Function: Calculates Total Price and Snapshots Item Details ---
    async calculateOrderTotalAndSanitize(items) {
        let totalAmount = 0;
        const sanitizedItems = [];
        const productIds = items.map(item => item.productId);

        const products = await ProductRepository.findAll({ _id: { $in: productIds }, isAvailable: true });
        if (products.length !== productIds.length) {
            throw new Error('One or more products are unavailable or do not exist.');
        }

        const productMap = new Map(products.map(p => [p._id.toString(), p]));

        for (const item of items) {
            const product = productMap.get(item.productId);
            if (!product) continue;

            const priceAtOrder = product.price;
            const itemTotal = priceAtOrder * item.quantity;
            totalAmount += itemTotal;

            sanitizedItems.push({
                product: item.productId,
                name: product.name,
                quantity: item.quantity,
                priceAtOrder: priceAtOrder,
                notes: item.notes || '',
                customizations: item.customizations || []
            });
        }

        return { totalAmount, sanitizedItems };
    }

    // --- Back Office Dashboard Methods (Now calling Repository methods) ---

    /**
     * Retrieves recent orders for the staff dashboard view.
     */
    async getDashboardOrders() {
        // ✅ CORRECT: Delegate complex finding and population logic to the Repository
        const populateOptions = ['user', 'table'];
        const limit = 50;
        const sort = { createdAt: -1 };
        
        // This assumes your OrderRepository has a method like findWithPopulationAndLimit
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
        // ✅ CORRECT: Delegate finding by ID and detailed population to the Repository
        const populateOptions = ['client', 'table', 'items.product'];

        // This assumes your OrderRepository has a method like findByIdWithPopulation
        const order = await OrderRepository.findByIdWithPopulation(
            orderId,
            populateOptions
        );
            
        if (!order) {
            throw new Error('Order not found.');
        }
        return order;
    }

    // --- Core Business Logic Methods ---

    /**
     * Creates a new order and updates the table status.
     */
    async createNewOrder(tableIp, items, clientId = null) {
        // ... (logic remains the same, as it already calls repository methods)
        const table = await TableRepository.findTableByIp(tableIp);
        if (!table) {
            throw new Error('Invalid table IP address. Order cannot be placed.');
        }
        if (table.status !== 'Vacant' && table.currentOrder) {
            throw new Error('Table is already occupied with an open order.');
        }
        
        const { totalAmount, sanitizedItems } = await this.calculateOrderTotalAndSanitize(items);
        
        const orderData = {
            table: table._id,
            client: clientId,
            items: sanitizedItems,
            totalAmount: totalAmount,
            status: 'Pending',
            paymentDetails: { method: 'None', status: 'Unpaid' }
        };

        const newOrder = await OrderRepository.create(orderData);
        await TableRepository.updateTableStatusAndOrder(table._id, 'Occupied', newOrder._id);

        return newOrder;
    }

    /**
     * Updates the status of an order (used by Back Office/Kitchen).
     */
    async updateOrderStatus(orderId, newStatus) {
        const validStatuses = ['Pending', 'Processing', 'Ready', 'Served', 'Waiting Payment', 'Paid', 'Cancelled'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error('Invalid status update requested.');
        }

        // Already correctly calls repository method: updateStatus
        const updatedOrder = await OrderRepository.updateStatus(orderId, newStatus);
        if (!updatedOrder) {
            throw new Error('Order not found.');
        }

        if (newStatus === 'Paid' || newStatus === 'Cancelled') {
            await TableRepository.updateTableStatusAndOrder(updatedOrder.table, 'Needs Cleaning', null);
        }

        return updatedOrder;
    }

    /**
     * Deletes an order (used by Admin/Manager) and cleans up related table state.
     */
    async deleteOrder(orderId) {
        // ⚠️ NOTE: This still requires temporary access to the model to check status before deletion.
        // A better repository solution would be: this.orderRepository.findById(orderId, ['status', 'table'])
        const order = await OrderRepository.findById(orderId);
        if (!order) {
            throw new Error('Order not found.');
        }

        if (order.status !== 'Pending' && order.status !== 'Cancelled') {
            throw new Error('Cannot delete an active or completed order. Please cancel it first.');
        }
        
        // Already correctly calls repository method: delete
        const deletedOrder = await OrderRepository.deleteById(orderId);
        
        if (order.table) {
             await TableRepository.updateTableStatusAndOrder(order.table, 'Vacant', null);
        }
        
        return deletedOrder;
    }
}

module.exports = OrderService;