

const TableService = require('../../services/tableService');
const DeviceService = require('../../services/deviceService'); 

/**
 * GET /api/staff/tables - Renders the table management dashboard.
 * Assumes the route handler for '/api/staff/tables' calls this function.
 */
exports.showTables = async (req, res) => {
    try {
        const tablesData = await TableService.getAllTables(); 
        // 1. Fetch all devices to populate the dropdown
        const availableDevices = await DeviceService.getAllDevices(); // Assuming this service method exists
        
        res.render('staff/tables', { 
            tables: tablesData, 
            availableDevices: availableDevices, // <-- PASS DEVICES TO EJS
            user: req.user,
            currentPage: 'tables',
            message: req.query.message || 'All tables loaded successfully.' 
        });
    } catch (error) {
        console.error('Error fetching ALL tables:', error);
        
        // Handle errors during data fetching
        res.status(500).render('staff/error', { error: 'Failed to load table data.' });
    }
};

/**
 * POST /api/staff/tables - Create new table
 */
exports.createTable = async (req, res) => {
    try {
        // 1. Controller destructures the required payload
        const { tableNumber, ipAddress, status } = req.body;
        
        // 2. Call the Service with the raw data
        const newTable = await TableService.createTable({ 
            tableNumber, 
            ipAddress, 
            status 
        });
        
        // 3. Respond with success message (201 Created)
        res.status(201).json({ 
            message: 'Table created successfully', 
            table: newTable 
        });
        
    } catch (error) {
        console.error('Table Creation Failed:', error);
        // 4. Handle error responses
        let statusCode = 400;
        
        // Check for MongoDB duplicate key error (code 11000 for unique: true)
        if (error.code === 11000) { 
            error.message = 'Table number or IP Address already exists.';
        }
        if (error.code === 121 && error.errInfo && error.errInfo.details) {
        console.error('Validation Failure Details:', 
                      error.errInfo.details.schemaRulesNotSatisfied);
    }
        else if (error.name === 'ValidationError') {
    // This will extract the specific message like 'tableNumber is required'
    const errors = Object.values(error.errors).map(err => err.message);
    message = errors.join('; ');
    statusCode = 400; 
}
        
        res.status(statusCode).json({ 
            message: 'Failed to create table', 
            error: error.message 
        });
    }
};

/**
 * PUT /api/staff/tables/:id - Update table
 */
exports.updateTable = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // 1. Call the Service layer with the ID and raw data
        const updatedTable = await TableService.updateTable(id, updates);
        
        // 2. Respond with success
        res.json({ 
            message: `Table ${updatedTable.tableNumber} updated successfully`, 
            table: updatedTable 
        });
        
    } catch (error) {
        // 3. Handle errors thrown by the Service layer
        
        // Check for custom statusCode thrown by the service (e.g., 404 for 'Table not found')
        let statusCode = error.statusCode || 400; 

        // Check for MongoDB duplicate key error again
        if (error.code === 11000) { 
            error.message = 'Table number or IP Address already exists.';
            statusCode = 409; // Conflict
        }
        
        res.status(statusCode).json({ 
            message: error.statusCode === 404 ? 'Table not found' : 'Failed to update table',
            error: error.message 
        });
    }
};

/**
 * DELETE /api/staff/tables/:id - Delete table
 */
exports.deleteTable = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Controller calls the service function
        const deletedTable = await TableService.deleteTableById(id); 
        
        if (!deletedTable) {
             // This case is likely handled by the Service throwing a 404 error, 
             // but we keep the redundant check for robustness.
             return res.status(404).json({ message: 'Table not found' });
        }
        
        // OPTION: Redirect to the tables list with a success message (matching your user controller style)
        return res.redirect(`/api/staff/tables?message=Table ${deletedTable.tableNumber} deleted successfully.`);

    } catch (error) {
        console.error('Failed to delete table:', error.message);
        
        // If the service threw an error (e.g., 404), use the status code from the error
        const statusCode = error.statusCode || 400;

        // Redirect back to the tables list with an error message
        res.redirect(`/api/staff/tables?message=Error deleting table: ${error.message}`);
    }
};