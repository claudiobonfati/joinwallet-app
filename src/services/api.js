import axios from 'axios';

// baseURL: 'https://claudiobonfati-joinwallet.herokuapp.com/'

const api = axios.create({
  baseURL: 'http://192.168.0.103:3000/'
});

export default api;
