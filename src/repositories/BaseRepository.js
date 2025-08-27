/**
 * Base Repository Class
 * Single Responsibility: Provide common CRUD operations
 * Open/Closed Principle: Open for extension, closed for modification
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Create a new document
   */
  async create(data) {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {
      throw new Error(`Failed to create ${this.model.modelName}: ${error.message}`);
    }
  }

  /**
   * Find document by ID
   */
  async findById(id) {
    try {
      return await this.model.findById(id);
    } catch (error) {
      throw new Error(`Failed to find ${this.model.modelName} by ID: ${error.message}`);
    }
  }

  /**
   * Find all documents with optional filters
   */
  async findAll(filters = {}, options = {}) {
    try {
      const { sort = { createdAt: -1 }, limit, skip, select } = options;
      let query = this.model.find(filters);

      if (sort) query = query.sort(sort);
      if (skip) query = query.skip(skip);
      if (limit) query = query.limit(limit);
      if (select) query = query.select(select);

      return await query.exec();
    } catch (error) {
      throw new Error(`Failed to find ${this.model.modelName}: ${error.message}`);
    }
  }

  /**
   * Find one document with filters
   */
  async findOne(filters = {}) {
    try {
      return await this.model.findOne(filters);
    } catch (error) {
      throw new Error(`Failed to find ${this.model.modelName}: ${error.message}`);
    }
  }

  /**
   * Update document by ID
   */
  async updateById(id, data) {
    try {
      return await this.model.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Failed to update ${this.model.modelName}: ${error.message}`);
    }
  }

  /**
   * Delete document by ID
   */
  async deleteById(id) {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Failed to delete ${this.model.modelName}: ${error.message}`);
    }
  }

  /**
   * Count documents with filters
   */
  async count(filters = {}) {
    try {
      return await this.model.countDocuments(filters);
    } catch (error) {
      throw new Error(`Failed to count ${this.model.modelName}: ${error.message}`);
    }
  }

  /**
   * Check if document exists
   */
  async exists(filters = {}) {
    try {
      return await this.model.exists(filters);
    } catch (error) {
      throw new Error(`Failed to check existence of ${this.model.modelName}: ${error.message}`);
    }
  }
}

module.exports = BaseRepository; 