import axios from 'axios';

const serverUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://mp3doyoutube.netlify.app/api'
    : 'http://192.168.3.110:3072';

const api = axios.create({
  baseURL: serverUrl,
});

export default api;
