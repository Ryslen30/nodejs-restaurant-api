

const OrderRepository = require('../repositories/orderRepository');
const ProductRepository = require('../repositories/productRepository');
const TableRepository = require('../repositories/tableRepository');

class OrderService {
    constructor() {
        this.orderRepository = new OrderRepository();
        this.productRepository = new ProductRepository();
        this.tableRepository = new TableRepository();
        // You would also initialize UserRepository here if needed for client ID checks
    }

    // --- Helper Function: Calculates Total Price and Snapshots Item Details ---
    async calculateOrderTotalAndSanitize(items) {
        let totalAmount = 0;
        const sanitizedItems = [];
        const productIds = items.map(item => item.productId);

        // Fetch product details from the database (including price and name)
        const products = await this.productRepository.findAll({ _id: { $in: productIds }, isAvailable: true });
        if (products.length !== productIds.length) {
            throw new Error('One or more products are unavailable or do not exist.');
        }

        const productMap = new Map(products.map(p => [p._id.toString(), p]));

        // Create the price snapshot
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
                customizations: item.customizations || [] // Structured preference data
            });
        }

        return { totalAmount, sanitizedItems };
    }

    // --- Core Business Logic Methods ---

    /**
     * Creates a new order and updates the table status.
     * @param {string} tableIp - IP address from the client request.
     * @param {array} items - Array of { productId, quantity, customizations }.
     * @param {string} clientId - Optional User ID if the client is logged in.
     */
    async createNewOrder(tableIp, items, clientId = null) {
        // 1. Identify the Table based on IP address
        const table = await this.tableRepository.findTableByIp(tableIp);
        if (!table) {
            throw new Error('Invalid table IP address. Order cannot be placed.');
        }
        if (table.status !== 'Vacant' && table.currentOrder) {
            throw new Error('Table is already occupied with an open order.');
        }
        
        // 2. Apply Business Logic: Calculate Total and Snapshot Prices
        const { totalAmount, sanitizedItems } = await this.calculateOrderTotalAndSanitize(items);
        
        // 3. Prepare the Order Data
        const orderData = {
            table: table._id,
            client: clientId,
            items: sanitizedItems,
            totalAmount: totalAmount,
            status: 'Pending', // Initial status before kitchen processes it
            paymentDetails: { method: 'None', status: 'Unpaid' }
        };

        // 4. Data Access (Repository): Create the Order
        const newOrder = await this.orderRepository.create(orderData);

        // 5. Data Access (Repository): Update the Table Status
        // Mark table as occupied and link the new order ID to it
        await this.tableRepository.updateTableStatusAndOrder(table._id, 'Occupied', newOrder._id);

        return newOrder;
    }

    /**
     * Updates the status of an order (used by Back Office/Kitchen).
     * @param {string} orderId 
     * @param {string} newStatus - 'Processing', 'Ready', 'Served', etc.
     */
    async updateOrderStatus(orderId, newStatus) {
        // Business Rule: Validate the new status against the allowed enum
        const validStatuses = ['Pending', 'Processing', 'Ready', 'Served', 'Waiting Payment', 'Paid', 'Cancelled'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error('Invalid status update requested.');
        }

        // Data Access (Repository): Update the status
        const updatedOrder = await this.orderRepository.updateStatus(orderId, newStatus);
        if (!updatedOrder) {
            throw new Error('Order not found.');
        }

        // Business Rule: Handle Table Update if the order status changes to Paid/Cancelled
        if (newStatus === 'Paid' || newStatus === 'Cancelled') {
            await this.tableRepository.updateTableStatusAndOrder(updatedOrder.table, 'Needs Cleaning', null);
        }

        return updatedOrder;
    }

    // Other methods would include: 
    // - async getKitchenViewOrders() (Calls repository method)
    // - async handlePayment(orderId, paymentMethod) (Handles Stripe/Cash logic)
    // - async addItemsToExistingOrder(orderId, newItems) (Requires calculating total again)
}

module.exports = OrderService;