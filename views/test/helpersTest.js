const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "_user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  get "user2RandomID"() {
    return this["_user2RandomID"];
  },
  set "user2RandomID"(value) {
    this["_user2RandomID"] = value;
  },
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("email", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  }
}; 

