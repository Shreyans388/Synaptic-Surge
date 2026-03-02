import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5004/api", // adjust if needed
  withCredentials: true, // VERY IMPORTANT for cookie-based JWT
});
export default axiosInstance;