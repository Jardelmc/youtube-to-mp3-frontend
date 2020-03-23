import axios from 'axios';

const serverUrl =
  process.env.NODE_ENV === 'production'
    ? 'http://68.183.111.160:3072'
    : 'http://192.168.3.110:3072';

const api = axios.create({
  baseURL: serverUrl,
});

export default api;
