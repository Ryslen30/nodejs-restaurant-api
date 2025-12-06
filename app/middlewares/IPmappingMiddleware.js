const deviceRepository = require('../repositories/deviceRepository'); 
const tableRepository = require('../repositories/tableRepository');



/**
 * Middleware to identify the Table based on the incoming request's IP address.
 * * Flow: IP String -> Device Document -> Table Document
 */
exports.identifyTable = async (req, res, next) => {
    try {
        // AGGRESSIVE FIX: Prioritize the custom header over the automatically detected req.ip.
        // This is necessary because req.ip on localhost/emulator often forces '::1'.
        const headerIp = req.headers['x-table-ip'];
        
        let tableIp;

        if (headerIp) {
             // If the tester provided a custom IP (e.g., 192.168.1.105), use it.
             tableIp = headerIp;
        } else {
             // Otherwise, fall back to the IP detected by Express (likely ::1 or 127.0.0.1).
             tableIp = req.ip; 
        }

        // --- DEBUG: Confirm the value being used for the lookup ---
        console.log("--- DEBUG: IP used for database lookup:", tableIp);
        
        if (!tableIp || tableIp === '::1' || tableIp === '127.0.0.1') {
            // Check if we are using a test IP and try to match it if available.
            if (!headerIp) {
                console.warn(`Local loopback IP (${tableIp}) detected and no X-Table-IP header set. Order cannot be placed.`);
                // We proceed without attaching req.table, and the service will handle the failure.
                // Or, if your service logic needs to find a real table, we must throw here.
                // Assuming we throw to maintain the business rule:
                throw new Error(`Device not found for IP: ${tableIp}. Order cannot be placed. Please use the X-Table-IP header for testing.`);
            }
        }

        // 1. Find the Device associated with the IP address string
        const device = await deviceRepository.findDeviceByIp(tableIp);

        if (!device) {
            console.warn(`Device not found for IP: ${tableIp}.`);
            // Throw the business error directly if the device is not found
            throw new Error(`Device not found for IP: ${tableIp}. Order cannot be placed.`);
        }
        
        // 2. Find the Table that references this Device ID
        const table = await tableRepository.findTableByDeviceId(device._id);

        if (!table) {
            console.warn(`Table not configured for device ID: ${device._id}.`);
            throw new Error(`Table not configured for device ID: ${device._id}. Order cannot be placed.`);
        }

        // 3. Attach the found table object to the request for the controller
        req.table = table;

        next();

    } catch (error) {
        // Log the specific error for debugging on the server
        console.error("IP Middleware Error:", error.message);
        
        // Ensure the error message is correctly returned to the client
        const statusCode = error.message.includes("not found") || error.message.includes("not configured") ? 400 : 500;
        
        return res.status(statusCode).json({ 
            message: error.message || "Internal server error during table lookup."
        });
    }
};

