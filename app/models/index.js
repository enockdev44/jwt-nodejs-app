class Model {
  constructor(collection, schema) {
    this.collection = collection;
    this.schema = schema;
  }

  async create(data) {
    const document = await this.collection.insertOne(data);
    return document.ops[0];
  }

  async find(query) {
    return this.collection.find(query).toArray();
  }

  async findById(id) {
    return this.collection.findOne({ _id: ObjectId(id) });
  }

  async update(id, data) {
    await this.collection.updateOne({ _id: ObjectId(id) }, { $set: data });
    return this.findById(id);
  }

  async delete(id) {
    return this.collection.deleteOne({ _id: ObjectId(id) });
  }
}

module.exports = Model;