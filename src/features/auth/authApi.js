import api from "../../shared/api/axios";

export async function getUsers() {
  const res = await api.get("/users");
  return res.data;
}

export async function findUserByLogin(login) {
  const users = await getUsers();
  const value = login.trim().toLowerCase();
  const phoneValue = login.trim().replace(/\D/g, ""); // только цифры

  return users.find((u) => {
    const byUsername = u.username?.toLowerCase() === value;
    const byEmail = u.email?.toLowerCase() === value;
    const byPhone =
      u.phone && u.phone.replace(/\D/g, "") === phoneValue;

    return byUsername || byEmail || byPhone;
  });
}

export async function isUsernameTaken(username, exceptUserId) {
  const users = await getUsers();
  return users.some(
    (u) =>
      u.username?.toLowerCase() === username.trim().toLowerCase() &&
      u.id !== exceptUserId
  );
}

export async function isEmailTaken(email, exceptUserId) {
  if (!email) return false;
  const users = await getUsers();
  return users.some(
    (u) =>
      u.email?.toLowerCase() === email.trim().toLowerCase() &&
      u.id !== exceptUserId
  );
}

export async function isPhoneTaken(phone, exceptUserId) {
  if (!phone) return false;
  const users = await getUsers();
  const phoneValue = phone.trim().replace(/\D/g, "");

  return users.some(
    (u) =>
      u.phone &&
      u.phone.replace(/\D/g, "") === phoneValue &&
      u.id !== exceptUserId
  );
}

export async function registerUser(userData) {
  const res = await api.post("/users", userData);
  return res.data;
}

export async function loginUser(login, password) {
  const user = await findUserByLogin(login);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user.pass !== password) {
    throw new Error("WRONG_PASSWORD");
  }

  const { pass: _, ...safeUser } = user;
  return safeUser;
}

export async function updateUserApi(userId, data) {
  const res = await api.patch(`/users/${userId}`, data);
  return res.data;
}

export async function getUserById(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}