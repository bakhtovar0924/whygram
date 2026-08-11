import api from "../../shared/api/axios";

export async function getUsersList() {
  const res = await api.get("/users");
  return Array.isArray(res.data) ? res.data : [];
}
