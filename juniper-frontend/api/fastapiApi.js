import axios from "axios";
import { findTokenCookie } from "../pages/login";


const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});


export async function getAllGuidelines() {
  try {

    let token = findTokenCookie();

    

    if (!token) {
      return null;
    }

    const response = await axiosInstance.get(`/list/guidelines`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching guidelines", error);
    return null;
  }
}

export async function getGuidelineBundle(guideline) {
  try {

    let token = findTokenCookie();

    

    if (!token) {
      return null;
    }



    const response = await axiosInstance.get(`/read/guideline`, {
      params: {
        file_name: guideline,
      },
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getGuidelineVersions(item_key) {
  try {

    let token = findTokenCookie();

    

    if (!token) {
      return null;
    }




    const response = await axiosInstance.get(`/list/versions`, {
      params: {
        file_name: item_key,
      },
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching item versions", error);
    throw error; // Re-throw the error so it can be caught in the component
  }
}

export async function updateGuidelineMetadata(file_name, status) {
  try {

    let token = findTokenCookie();

    

    if (!token) {
      return null;
    }



    const response = await axiosInstance.put(
      `/update/metadata?file_name=${encodeURIComponent(
        file_name
      )}&status=${encodeURIComponent(status)}`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getPatients(condition) {
  try {

    let token = findTokenCookie();

    

    if (!token) {
      return null;
    }



    if (!condition) {
      const response = await axiosInstance.get("/medplum/patients", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      return response.data.entry;
    } else {
      const response = await axiosInstance.get(
        "/medplum/patient_by_condition?code=" + condition.label, {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      return response.data._content;
    }
  } catch (error) {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 307)
    ) {
      const currentUrl = window.location.pathname;
      window.location.href = `${baseURL}/medplum/authorize?next=${encodeURIComponent(
        currentUrl
      )}`;
      return null;
    } else {
      console.error(`Error: ${error}`);
      throw error;
    }
  }
}

export async function getPatientBundle(patientId) {
  try {

    let token = findTokenCookie();

    

    if (!token) {
      return null;
    }



    const response = await axiosInstance.get(
      `/medplum/patient/${patientId}/everything`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error: ${error}`);
    return null;
  }
}

export async function getPatientResources(category, patient_id) {
  try {

    let token = findTokenCookie();

    

    if (!token) {
      return null;
    }



    const response = await axiosInstance.get(
      `/medplum/patient_resources?resource_type=${category}&id=${patient_id}`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    return response.data.entry;
  } catch (error) {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 307)
    ) {
      const currentUrl = window.location.pathname;
      window.location.href = `${baseURL}/medplum/authorize?next=${encodeURIComponent(
        currentUrl
      )}`;
    } else {
      console.error(`Error: ${error}`);
      throw error;
    }
  }
}
export async function getPatientEverything(patientId) {
  try {

    let token = findTokenCookie();

    

    if (!token) {
      return null;
    }


    const response = await axiosInstance.get(
      `/medplum/patient/${patientId}/everything`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    return response.data.entry;
  } catch (error) {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 307)
    ) {
      const currentUrl = window.location.pathname;
      window.location.href = `${baseURL}/medplum/authorize?next=${encodeURIComponent(
        currentUrl
      )}`;
    } else {
      console.error(`Error: ${error}`);
      throw error;
    }
  }
}

export async function getConditions() {
  try {

    let token = findTokenCookie();

    

    if (!token) {
      return null;
    }


    const response = await axiosInstance.get("/medplum/conditions", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return response.data._content;
  } catch (error) {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 307)
    ) {
      const currentUrl = window.location.pathname;
      window.location.href = `${baseURL}/medplum/authorize?next=${encodeURIComponent(
        currentUrl
      )}`;
    } else {
      console.error(`Error: ${error}`);
      return null;
    }
  }
}

export async function validateAccessCode(code) {
  try {
    if (code) {
      const response = await axiosInstance.get(
        `${baseURL}/auth/authenticate?access_code=${code}`
      );
      console.log(response);
      return response.status == 200;
    } else {
      console.log("no code");
      return null;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function validateToken(tokenFromCookies = false) {
  try {
    let token;

    if (tokenFromCookies) token = tokenFromCookies
    else token = findTokenCookie();

    if (!token) {
      return null;
    }

    const response = await axiosInstance.get(`${baseURL}/auth/try_auth`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    return response.status == 200;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
