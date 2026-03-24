import { apiClient, setTokens, clearTokens } from "../client";
import type { LoginRequest, LoginResponse, User, UserListItem, AdminUserUpdateRequest, UserListParams } from "../types";
import type { PaginatedData } from "../types/common";

export const authClient = {
  login: async (data: LoginRequest) => {
    const res = await apiClient<LoginResponse>("/accounts/login/", {
      method: "POST",
      body: data,
    });
    if (res.success && res.data) {
      setTokens(res.data.access, res.data.refresh);
    }
    return res;
  },

  logout: () => {
    clearTokens();
  },

  getProfile: () => apiClient<User>("/accounts/profile/"),
};

export const usersClient = {
  list: (params?: UserListParams) =>
    apiClient<PaginatedData<UserListItem>>("/accounts/users/", { params: params as Record<string, string | number | boolean | undefined> }),

  get: (id: string) => apiClient<User>(`/accounts/users/${id}/`),

  update: (id: string, data: AdminUserUpdateRequest) =>
    apiClient<User>(`/accounts/users/${id}/`, { method: "PATCH", body: data }),
};
