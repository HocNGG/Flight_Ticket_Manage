
export interface LoginRequest {
  email: string;
  password?: string; 
}

export interface LoginResponse {
  accessToken?: string;
  token?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber : string
}

export interface RegisterResponse {
  userId?: string;
  email?: string;
}