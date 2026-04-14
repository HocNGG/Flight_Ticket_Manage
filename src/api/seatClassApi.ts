import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api';
import type { SeatClass } from '../types/flight/seatclass';

const seatClassApi = {
  getAllClass(): Promise<ApiResponse<SeatClass[]>> {
    return axiosClient.get('/seat-classes');
  }
};

export default seatClassApi;