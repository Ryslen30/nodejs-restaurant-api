

const TableRepository = require('../repositories/tableRepository');
const tableRepository = new TableRepository(); // Initialize the repository

/**
 * Middleware to identify the table associated with the incoming IP address.
 */
exports.identifyTable = async (req, res, next) => {
    // NOTE: In a production environment, you might need complex logic 
    // to get the true client IP (e.g., checking x-forwarded-for headers 
    // if using a proxy), but for a local network, req.ip often suffices.
    const clientIp = req.ip; 

    if (!clientIp) {
        return res.status(400).json({ message: 'Could not determine client IP address.' });
    }
    
    try {
        // 1. Data Access: Look up the table based on the IP address
        const table = await tableRepository.findTableByIp(clientIp);

        if (!table) {
            // Business Rule: The tablet is not recognized/configured
            return res.status(440).json({ message: 'Tablet not recognized. Please contact staff.' });
        }

        // 2. Attach Table Info to Request
        // Attach the necessary data to the request object for use in the Controller
        req.table = {
            id: table._id,
            number: table.tableNumber,
            status: table.status
        };

        // Proceed to the Controller
        next();
    } catch (error) {
        console.error("IP Middleware Error:", error.message);
        // Internal server error during database lookup
        return res.status(500).json({ message: 'Internal server error during table lookup.' });
    }
};