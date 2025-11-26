const TableService = require('../../services/Table.service');

const tableService = new TableService();

/**
 * Handles GET /api/staff/tables - Renders the table management EJS view.
 */
exports.renderTableManagement = async (req, res) => {
    try {
        const tables = await tableService.getAllTables();
        
        // Output: Renders EJS template
        res.render('tableManagement', { 
            title: 'Table Status and Configuration', 
            tables: tables 
        });
    } catch (error) {
        console.error('Back Office Table Render Error:', error.message);
        res.status(500).send('<h1>Error loading table management.</h1>');
    }
};

/**
 * Handles PUT /api/staff/tables/:tableId/reset - Staff Action (JSON)
 */
exports.resetTable = async (req, res) => {
    const { tableId } = req.params;
    try {
        await tableService.resetTableStatus(tableId);
        // Output: JSON success for the AJAX call
        res.status(200).json({ message: 'Table successfully reset to Vacant.' });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

/**
 * Handles POST /api/staff/tables - Create Table (JSON)
 */
exports.createTable = async (req, res) => {
    try {
        const newTable = await tableService.createTable(req.body);
        res.status(201).json({ 
            message: `Table ${newTable.tableNumber} created.`, 
            table: newTable 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};