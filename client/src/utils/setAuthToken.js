import axios from "axios";

const setAuthToken = token => {
  if (token) {
    // Set header auth to token
    axios.defaults.headers.common["Authorization"] = token;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

export default setAuthToken;
