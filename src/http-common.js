import axios from "axios";

export const axiosApi = axios.create({
  baseURL: "http://103.176.110.28:8080/",
  headers: {
    "Content-type": "Application/json",
  },
});

axiosApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      removeAccessToken()
      window.location.href = "/login";
      return;
    }

    return Promise.reject(error);
  }
);

export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

export const removeAccessToken = () => {
  return localStorage.removeItem("access_token");
};

export const buildHeaders = (data) => {
  const access_token = getAccessToken();
  return {
    headers: {
      'Authorization': `Bearer ${access_token}`,
    },
    data
  };
};


export default class ApiService {
  static async post(path, data) {
    return await axiosApi.post(path, data, buildHeaders());
  }

  static async get(path) {
    return await axiosApi.get(path, buildHeaders());
  }

  static async put(path, data) {
    return await axiosApi.put(path, data, buildHeaders());
  }

  static async delete(path,data) {
    return await axiosApi.delete(path, buildHeaders(data));
  }
}
