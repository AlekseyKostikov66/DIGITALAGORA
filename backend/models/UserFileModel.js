const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/users.json');

class UserModel {
  static async init() {
    try {
      await fs.access(DB_PATH);
    } catch {
      await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
      await fs.writeFile(DB_PATH, JSON.stringify([]));
    }
  }

  static async findOne(query) {
    await this.init();
    const users = JSON.parse(await fs.readFile(DB_PATH, 'utf-8'));
    if (query.email) {
      return users.find(user => user.email === query.email);
    }
    return null;
  }

  static async save(userData) {
    await this.init();
    const users = JSON.parse(await fs.readFile(DB_PATH, 'utf-8'));
    const newUser = { id: Date.now(), ...userData };
    users.push(newUser);
    await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2));
    return newUser;
  }
}

module.exports = UserModel;