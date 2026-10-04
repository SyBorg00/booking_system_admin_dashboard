const API_URL = process.env.NEXT_PUBLIC_API_URL;


if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined.");
}

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {

    // Add the token to the request headers if it exists
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",

            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ?? "An API request failed."
        );
    }

    return data;
}