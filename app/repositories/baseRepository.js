

class BaseRepository {
    constructor(model) {
        this.model = model; // The Mongoose Model (e.g., Product, Order)
    }

    // --- Basic CRUD Operations ---

    async create(data) {
        // 🛑 ADD THIS CRITICAL LOG 🛑
    console.log('Repository: Data being created (check for ipAddress):', data);
    
    // Check if the problematic field is present
    if ('ipAddress' in data) {
        console.error('ALERT: ipAddress IS present in the creation data! Value:', data.ipAddress);
    }
        return this.model.create(data);
    }

    async findById(id, populate = null) {
        let query = this.model.findById(id);
        if (populate) {
            query = query.populate(populate);
        }
        return query.exec();
    }

    async findOne(filter, populate = null) {
        let query = this.model.findOne(filter);
        if (populate) {
            query = query.populate(populate);
        }
        return query.exec();
    }

    async findAll(filter = {}, populate = null) {
        let query = this.model.find(filter);
        if (populate) {
            query = query.populate(populate);
        }
        return query.exec();
    }

   // In your tableRepository async updateById(id, setPayload, unsetPayload):
async updateById(id, setPayload, unsetPayload) {
    const updateOperators = {};

    // Only include $set if there are fields to update
    if (Object.keys(setPayload).length > 0) {
        updateOperators.$set = setPayload;
    }
    
    // Only include $unset if we need to remove fields (like ipAddress)
    if (Object.keys(unsetPayload).length > 0) {
        updateOperators.$unset = unsetPayload;
    }

    // CRITICAL: MongoDB will remove the field when $unset is used
    return this.model.findByIdAndUpdate(
        id, 
        updateOperators, 
        { 
            new: true, 
            runValidators: true 
        }
    );
}

    async deleteById(id) {
        return this.model.findByIdAndDelete(id);
    }
}

module.exports = BaseRepository;