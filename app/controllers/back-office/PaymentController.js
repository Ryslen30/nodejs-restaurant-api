const PaymentService = require('../../services/Payment.service');

const paymentService = new PaymentService();

/**
 * Handles POST /api/staff/orders/:orderId/pay/cash - Staff Action (JSON)
 */
exports.payWithCash = async (req, res) => {
    const { orderId } = req.params;
    
    try {
        const updatedOrder = await paymentService.processCashPayment(orderId);
        
        // Output: JSON success
        res.status(200).json({ 
            message: `Order ${orderId} successfully closed with cash.`,
            order: updatedOrder 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Handles POST /api/staff/orders/:orderId/pay/card - Staff Action (JSON)
 */
exports.initiateCardPayment = async (req, res) => {
    const { orderId } = req.params;
    
    try {
        const paymentIntent = await paymentService.processCardPayment(orderId, req.body);
        
        // Output: Returns details needed for the staff terminal to finalize the transaction
        res.status(200).json({ 
            message: 'Card payment process started.',
            paymentDetails: paymentIntent 
        });
    } catch (error) {
        console.error('Payment Initiation Error:', error.message);
        res.status(500).json({ message: 'Card payment failed: ' + error.message });
    }
};