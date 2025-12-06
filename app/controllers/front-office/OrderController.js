const OrderService = require('../../services/orderService');

const orderService = new OrderService();

/**
 * Handles POST /api/client/orders
 * Creates a new order from the client tablet. (JSON)
 */
exports.createOrder = async (req, res) => {
    // req.ip is the source IP address; req.table.id is attached by IPMiddleware
    const tableIp = req.ip; 
    const items = req.body.items; 
    const clientId = req.body.clientId || null; 

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Order must contain items.' });
    }

    try {
        const newOrder = await orderService.createNewOrder(tableIp, items, clientId);

        // Output: JSON response for the Front Office
        res.status(201).json({
            message: 'Order placed successfully.',
            orderId: newOrder._id,
            total: newOrder.totalAmount
        });
    } catch (error) {
        console.error('Front Office Order Creation Error:', error.message);
        const status = error.message.includes('Invalid') || error.message.includes('occupied') ? 400 : 500;
        res.status(status).json({ message: error.message });
    }
};

/**
 * Handles GET /api/client/orders/current
 * Retrieves the currently open order for a table. (JSON)
 */
exports.getCurrentOrder = async (req, res) => {
    // req.table.id is attached by IPMiddleware
    const tableId = req.table.id;

    try {
        const order = await orderService.getCurrentTableOrder(tableId);
        
        // Output: JSON response
        res.status(200).json({ 
            message: order ? 'Order found.' : 'No open order.', 
            order 
        });
    } catch (error) {
        console.error('Front Office Get Current Order Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};