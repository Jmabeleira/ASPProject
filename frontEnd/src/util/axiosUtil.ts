import axios from "axios";
import { AxiosResponse } from "axios";

export async function sendRequest<T, R = any>(url: string, body: T): Promise<AxiosResponse<R>> {
  console.log("Sending request to:", url);
  console.log("Request body:", body);
  try {
    const response = await axios.post<R>(url, body);
    return response; 
  } catch (error) {
    console.error("There was an error!", error);
    throw error;
  }
}

export async function sendGetRequest<R = any>(url: string): Promise<AxiosResponse<R>> {
  console.log("Sending GET request to:", url);
  try {
    const response = await axios.get<R>(url);
    return response;
  } catch (error : any) {
    if (error.code === 'ERR_NETWORK') {
      console.warn("Backend is not available, skipping request.");
      throw new Error("Backend is not available, skipping request.");
    }
    console.error("There was an error!", error);
    throw error;
  }
}

export async function sendDeleteRequest<T,R = any>(url: string,body: T): Promise<AxiosResponse<R>> {
  console.log("Sending DELETE request to:", url);
  try {
    return await axios.delete(url, { data: body });
  } catch (error) {
    console.error("There was an error!", error);
    throw error;
  }
}

export async function sendPutRequest<T,R = any>(url: string,body: T): Promise<AxiosResponse<R>> {
  console.log("Sending PUT request to:", url);
  try {
    const response = await axios.put<R>(url, body);
    return response;
  } catch (error) {
    console.error("There was an error!", error);
    throw error;
  }
}

export default {
  sendRequest,
  sendGetRequest};

