const API_PORT = import.meta.env.VITE_TOKEN_API_PORT || "8000";
const BASE_URL =
  import.meta.env.VITE_TOKEN_API_BASE_URL || `http://localhost:${API_PORT}/api/token`;

async function parseResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Something went wrong");
  }

  return data;
}

export async function fetchTokens() {
  const response = await fetch(BASE_URL);
  return parseResponse(response);
}

export async function createToken(payload) {
  const response = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function fetchToken(tokenId) {
  const response = await fetch(`${BASE_URL}/${tokenId}`);
  return parseResponse(response);
}

export async function redeemToken(payload) {
  const response = await fetch(`${BASE_URL}/redeem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}
