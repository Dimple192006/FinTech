const BASE_URL = "http://localhost:6000/api/token";

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
