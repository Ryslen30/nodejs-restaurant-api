// File: src/services/TableService.js

// Assuming TableRepository is implemented to handle data access for the Table model
const tableRepository = require('../repositories/tableRepository')
const deviceRepository = require('../repositories/deviceRepository');

// No bcrypt needed as tables don't have passwords

class TableService {


/**
 * Fetches ALL tables and populates the linked Device document.
 * @returns {Promise<Array>} An array of ALL table documents with populated ipAddress fields.
 */
static async getAllTables() { 
    // Define the field to populate: 'ipAddress'
    const populateField = 'ipAddress';
    return await tableRepository.findAll({}, populateField);
}

   // Example: In your TableService.js (for a method like getTableById)

static async getTableById(tableId) {
    // 1. Define the population path. 
    // Mongoose needs to populate the field named 'ipAddress'.
    const populateOptions = 'ipAddress'; 
    
    // 2. Call the repository, passing the populate option
    // Assuming your baseRepository is inherited or used by the specific repository
    const table = await tableRepository.findOne({ _id: tableId }, populateOptions);
    
    return table;
}
    
    /**
     * Deletes a table by ID.
     * @param {string} tableId 
     * @returns {Promise<Object>} The deleted table document.
     * @throws {Error} if the table is not found.
     */
    static async deleteTableById(tableId) {
        const deletedTable = await tableRepository.deleteById(tableId);
        
        if (!deletedTable) {
            // Throw a specific error that the controller can translate to a 404
            const error = new Error('Table not found.');
            error.statusCode = 404; 
            throw error; 
        }

        return deletedTable;
    }
    
   
    
    /**
     * Constructs and creates a new table document.
     * @param {object} data - Contains tableNumber, ipAddress (Device ID or ""), status
     * @returns {Promise<Object>} The new table document.
     */
    static async createTable({ tableNumber, ipAddress, status }) {
        
        // Normalize the input: Get the trimmed ID, or null/undefined if empty/missing
        const rawDeviceId = ipAddress && typeof ipAddress === 'string' ? ipAddress.trim() : ipAddress;

        // Start with the basic required fields
        const tableToCreate = {
            tableNumber,
            status: status || 'Vacant',
        };

        // 1. Business Logic: Check if a device ID was provided at all
        // We check if the rawDeviceId is NOT null, NOT undefined, and NOT an empty string
        if (rawDeviceId) {
            
            // 2. Validate existence of the Device ID (Referential Integrity)
            const deviceExists = await deviceRepository.findById(rawDeviceId);
            
            if (!deviceExists) {
                // If the device ID is invalid or non-existent, throw a structured error
                const error = new Error(`Device ID ${rawDeviceId} does not exist. Cannot assign to table.`);
                error.statusCode = 400; // Bad Request
                throw error;
            }
            
            // 3. ONLY if the device exists, add the ipAddress field to the document
            tableToCreate.ipAddress = rawDeviceId;
        } 
        
        // Note: If rawDeviceId is null, undefined, or "", the ipAddress field is simply omitted.

        // 4. Data Access: Call the Repository's create method
        const newTable = await tableRepository.create(tableToCreate);
        
        return newTable;
    }

   /**
 * Updates an existing table, handling IP Address unassignment via $unset.
 * @param {string} tableId 
 * @param {Object} updates - Fields to update.
 * @returns {Promise<Object>} The updated table document.
 * @throws {Error} if the table is not found.
 */
static async updateTable(tableId, updates) {
    console.log('Service: Updates Received (Before Clean):', { tableId, updates });
    
    // Payload for fields being set/updated (e.g., tableNumber, status)
    const updatesToSet = { ...updates }; 
    
    // Payload for fields being removed from the document ($unset)
    const updatesToUnset = {}; 

    // 1. Business Logic: Handle IP Address Unassignment
    const ipVal = updatesToSet.ipAddress;
    
    // Check if the client explicitly sent null, or an empty string which means unassign
    if (ipVal === null || (typeof ipVal === 'string' && ipVal.trim() === '')) {
        
        // If unassigning, REMOVE the field from the $set payload
        delete updatesToSet.ipAddress; 
        
        // ADD the field to the $unset payload to remove it from the document
        updatesToUnset.ipAddress = ''; 
        
        console.log('Service: IP Address moved to $unset payload.');
    }
    // If ipVal is a valid ID string/ObjectId, it remains in updatesToSet.ipAddress and will be handled by $set.

    // 2. Data Access: Call the repository with both $set and $unset payloads
    console.log('Service: Payload Sent to Repository:', { set: updatesToSet, unset: updatesToUnset });

    // NOTE: tableRepository.updateById must be updated to accept both objects
    const updatedTable = await tableRepository.updateById(tableId, updatesToSet, updatesToUnset);
    
    // 3. Business Rule: Check if the table was actually updated (found)
    if (!updatedTable) {
        const error = new Error('Table not found');
        error.statusCode = 404; // Custom property for the controller
        throw error; 
    }
    
    return updatedTable;
}
}

module.exports = TableService;