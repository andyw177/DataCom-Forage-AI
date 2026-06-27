const API_BASE_URL = "http://localhost:3001/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

export function getUsers(userId, search = "") {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }

  const suffix = params.toString() ? `?${params}` : "";
  return request(`/users${suffix}`, {
    headers: {
      "x-user-id": userId
    }
  });
}

export function getFeed(userId, cursor = "0") {
  return request(`/kudos?limit=5&cursor=${cursor}`, {
    headers: {
      "x-user-id": userId
    }
  });
}

export function createKudos(userId, payload) {
  return request("/kudos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId
    },
    body: JSON.stringify(payload)
  });
}

export function getAdminKudos(userId, status) {
  return request(`/admin/kudos?status=${status}`, {
    headers: {
      "x-user-id": userId
    }
  });
}

export function moderateKudos(userId, kudosId, payload) {
  return request(`/admin/kudos/${kudosId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId
    },
    body: JSON.stringify(payload)
  });
}

export function deleteKudos(userId, kudosId) {
  return request(`/admin/kudos/${kudosId}`, {
    method: "DELETE",
    headers: {
      "x-user-id": userId
    }
  });
}

