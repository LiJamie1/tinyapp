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
    assert.strictEqual(randomStringLength, 6);
  });
});
