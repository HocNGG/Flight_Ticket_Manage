import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api';
import type { UserInfoResponse } from '../types/user';

const userApi = {
      getprofile():Promise<ApiResponse<UserInfoResponse>> {
            return axiosClient.get('/users/me');
      }
};
export default userApi;