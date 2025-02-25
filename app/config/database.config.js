const { MongoClient, ObjectId } = require('mongodb');

class Database {
  constructor(url, dbName) {
    this.url = url;
    this.dbName = dbName;
    this.client = new MongoClient(this.url, { useNewUrlParser: true, useUnifiedTopology: true });
  }

  connect() {
    this.client.connect();
    this.db = this.client.db(this.dbName);
  }

  collection(name) {
    return this.db.collection(name);
  }

  close() {
    return this.client.close();
  }
}

module.exports = Database;
