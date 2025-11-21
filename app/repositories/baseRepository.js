

class BaseRepository {
    constructor(model) {
        this.model = model; // The Mongoose Model (e.g., Product, Order)
    }

    // --- Basic CRUD Operations ---

    async create(data) {
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

    async updateById(id, data) {
        return this.model.findByIdAndUpdate(id, data, { new: true }); // { new: true } returns the updated document
    }

    async deleteById(id) {
        return this.model.findByIdAndDelete(id);
    }
}

module.exports = BaseRepository;