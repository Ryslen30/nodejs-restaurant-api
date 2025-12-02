const OrderService = require('../../services/orderService');

const orderService = new OrderService();

/**
 * Handles GET /api/staff/kitchen/pending - Kitchen View (JSON)
 * Provides a list of open orders for the staff dashboard.
 */
exports.getPendingOrders = async (req, res) => {
    try {
        const pendingOrders = await orderService.getKitchenViewOrders(); 

        // Output: JSON data for the staff Kitchen View frontend
        res.status(200).json({ orders: pendingOrders });
    } catch (error) {
        console.error('Back Office Get Pending Orders Error:', error.message);
        res.status(500).json({ message: 'Could not retrieve orders.' });
    }
};

/**
 * Handles PUT /api/staff/orders/:orderId/status - Staff Action (JSON)
 * Updates the status of an order (e.g., 'Ready', 'Served').
 */
exports.updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { newStatus } = req.body;

    if (!newStatus) {
        return res.status(400).json({ message: 'New status is required.' });
    }

    try {
        const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
        
        // Output: JSON confirmation for the EJS page's AJAX call
        res.status(200).json({
            message: `Order ${orderId} status updated to ${newStatus}.`,
            order: updatedOrder
        });
    } catch (error) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ message: error.message });
    }
};