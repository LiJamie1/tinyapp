//helper functions

const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};

// returns an object containing the id, email and password of a user
const findUserByEmail = (email, users) => {
  for (const user in users) {
    const currUser = users[user];
    if (currUser.email === email) {
      return currUser;
    }
  }
  return null;
};

// returns an object of urls that the current user has access to
const userUrls = (id, database) => {
  let urls = {};
  for (const url in database) {
    if (database[url].userID === id) {
      urls[url] = database[url];
    }
  }
  return urls;
};

module.exports = {
  generateRandomString,
  findUserByEmail,
  userUrls
}