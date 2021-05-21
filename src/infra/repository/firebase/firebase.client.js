const axios = require('axios').default;

const FirebaseClient = axios.create({
  baseURL: 'https://jobber-1-default-rtdb.firebaseio.com',
});

module.exports = FirebaseClient;
