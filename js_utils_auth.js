import { BASE_URL } from "./js_config.js";

export async function is_token_expired(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const userRes = await fetch(`${BASE_URL}/customers/me`, { headers });

    if (!userRes.ok) {
      return true; // token expired or invalid
    }

    const user = await userRes.json();
    return false; // token valid
  } catch (error) {
    return true; // assume token invalid on any error
  }
}
