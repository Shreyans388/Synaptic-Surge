import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5004/api", // adjust if needed
  withCredentials: true, // VERY IMPORTANT for cookie-based JWT
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
