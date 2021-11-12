const chai = require('chai');
const assert = chai.assert;
const {generateRandomString, findUserByEmail, userUrls, urlExists} = require('../helpers');


describe('#generateRandomString', function() {
  it('if called twice it should return as they are not equal', function() {
    const randomStringOne = generateRandomString();
    const randomStringTwo = generateRandomString();
    assert.notEqual(randomStringOne, randomStringTwo);
  });

  it('should return a 6 character string when called', function() {
    const randomStringLength = generateRandomString().length;
    assert.deepEqual(randomStringLength, 6);
  });
});

describe('#findUserByEmail', function() {
  it('should return an object containing information on the current user', function() {
    const targetUser = {
      id: 1111,
      email: 'j@j.ca',
      password: 123
    };
    const targetUserEmail = 'j@j.ca';
    const users = {
      user1: {
        id: 1111,
        email: 'j@j.ca',
        password: 123
      },
      user2: {
        id: 2222,
        email: 'k@k.ca',
        password: 234
      }
    };
    const result = findUserByEmail(targetUserEmail, users);
    assert.deepEqual(result, targetUser);
  });

  it('should return null if the user does not exist', function() {
    const targetUserEmail = 'j@j.ca';
    const users = {
      user1: {
        id: 1111,
        email: 'j@k.ca',
        password: 123
      },
      user2: {
        id: 2222,
        email: 'k@k.ca',
        password: 234
      }
    };
    const result = findUserByEmail(targetUserEmail, users);
    assert.deepEqual(result, null);
  });
});

describe('#userUrls', function() {
  it('should return an object of urls that a user has access to', function() {
    const userID = 'userRandomID';
    const urlDatabase = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID"},
      "9sm5xK": {
        longURL: "http://www.google.com",
        userID: "userRandomID2"}
    };
    const expected = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID"},
    };
    const result = userUrls(userID, urlDatabase);
    assert.deepEqual(result, expected);
  });

  it('should return an empty object if no userID match', function() {
    const userID = '11111';
    const urlDatabase = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID"},
      "9sm5xK": {
        longURL: "http://www.google.com",
        userID: "userRandomID2"}
    };
    const expected = {};
    const result = userUrls(userID, urlDatabase);
    assert.deepEqual(result, expected);
  });
});

describe('#urlExists', function() {
  it('if a url exists it returns true', function() {
    const urlDatabase = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID"},
      "9sm5xK": {
        longURL: "http://www.google.com",
        userID: "userRandomID2"}
    };
    const targetURL = 'b2xVn2';
    const result = urlExists(targetURL, urlDatabase);
    assert.isTrue(result);
  });

  it('if a url does not exist it returns null', function() {
    const urlDatabase = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID"},
      "9sm5xK": {
        longURL: "http://www.google.com",
        userID: "userRandomID2"}
    };
    const targetURL = 'b2xVn3';
    const result = urlExists(targetURL, urlDatabase);
    assert.strictEqual(result, null);
  });
});