// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // your backend
  withCredentials: true,            // needed for sessions
});

export default api;
