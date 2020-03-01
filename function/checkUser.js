var users = require("./users").items;
const findUser = function(name, password) {
  return users.find(function(item) {
    return item.name === name && item.password === password;
  });
};
module.exports = findUser;