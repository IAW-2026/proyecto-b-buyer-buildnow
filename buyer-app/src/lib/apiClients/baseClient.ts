import { auth } from "@clerk/nextjs/server";

interface ApiClientOptions extends RequestInit {
  serviceUrl?: string;
}

export async function apiClient(
  endpoint: string,
  options?: ApiClientOptions
) {
  const { getToken } = await auth();

  const token = await getToken();

  const {
    serviceUrl = "",
    headers,
    ...fetchOptions
  } = options || {};

  const response = await fetch(
    `${serviceUrl}${endpoint}`,
    {
      ...fetchOptions,

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...headers,
      },

      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `API Error ${response.status}: ${errorBody}`
    );
  }

  return response.json();
}