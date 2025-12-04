// app/controllers/back-office/OrderController.js

// 1. Import and instantiate the OrderService
const OrderService = require('../../services/orderService'); 
const orderService = new OrderService(); 

// --- Controller Methods (Delegating to Service Layer) ---

/**
 * GET /api/staff/orders - Renders the order management dashboard
 * Delegates to: OrderService.getDashboardOrders()
 */
exports.showOrders = async (req, res) => {
    try {
        // ✅ CORRECT: Delegate data fetching and business logic to the Service
        const orders = await orderService.getDashboardOrders(); 
        
        res.render('staff/orders', {
            currentPage: 'orders',
            orders: orders,
            message: '' 
        });

    } catch (error) {
        console.error("Error loading orders page:", error);
        
        // Fallback to render the orders view with an error message
        res.status(500).render('staff/orders', { 
            currentPage: 'orders',
            orders: [],
            message: 'Error: Failed to load order data from the server.'
        });
    }
};

/**
 * PUT /api/staff/orders/:id/status - Update order status
 * Delegates to: OrderService.updateOrderStatus(id, status)
 */
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        if (!status) {
            return res.status(400).json({ message: 'Status is required.' });
        }

        // ✅ CORRECT: Delegate update and related business logic to the Service
        const updatedOrder = await orderService.updateOrderStatus(id, status);

        res.json({
            message: `Order ${id.substring(0, 8)} status updated to ${updatedOrder.status}.`,
            order: updatedOrder
        });

    } catch (error) {
        console.error("Error updating order status:", error);
        // Map service-layer errors (e.g., 'not found', 'Invalid status') to appropriate HTTP status codes
        const statusCode = error.message.includes('not found') || error.message.includes('Invalid') ? 400 : 500;
        res.status(statusCode).json({ message: error.message || 'Failed to update order status.' });
    }
};

/**
 * GET /api/staff/orders/:id - Retrieves details for a single order
 * Delegates to: OrderService.getOrderById(id)
 */
exports.getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ CORRECT: Delegate fetching and detailed data preparation (population) to the Service
        const order = await orderService.getOrderById(id);
        
        res.json({
            message: 'Order details retrieved successfully.',
            order: order
        }); 
        
    } catch (error) {
        console.error("Error retrieving order details:", error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({ message: error.message || 'Failed to retrieve order details.' });
    } 
};

/**
 * DELETE /api/staff/orders/:id - Delete/Cancel an order
 * Delegates to: OrderService.deleteOrder(id)
 */
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        
        // ✅ CORRECT: Delegate deletion and associated cleanup (table status check) to the Service
        const deletedOrder = await orderService.deleteOrder(id);

        res.json({
            message: `Order ${id.substring(0, 8)} deleted successfully.`,
        });
        
    } catch (error) {
        console.error("Error deleting order:", error);
        // Map service-layer errors (e.g., 'Cannot delete an active order')
        const statusCode = error.message.includes('not found') || error.message.includes('Cannot delete') ? 400 : 500;
        res.status(statusCode).json({ message: error.message || 'Failed to delete order.', error: error.message });
    }
};