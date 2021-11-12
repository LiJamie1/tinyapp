//helper functions

const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};

const findUserByEmail = (email, users) => {
  for (const user in users) {
    const currUser = users[user];
    if (currUser.email === email) {
      return currUser;
    }
  }
  return null;
};

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