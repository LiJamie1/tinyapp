const chai = require('chai');
const assert = chai.assert;
const {generateRandomString, findUserByEmail, userUrls} = require('../helpers');


describe('#generateRandomString', function() {
  it('if called twice it should return as they are not equal', function() {
    const randomStringOne = generateRandomString();
    const randomStringTwo = generateRandomString();
    assert.notEqual(randomStringOne, randomStringTwo);
  });

  it('should return a 6 character string when called', function () {
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