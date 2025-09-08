// Base URL for API requests
// Uses environment variable VITE_API_URL if defined, otherwise falls back to localhost:5001
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Upload a file to the server
export async function uploadFile(file) {
    const fd = new FormData();
    fd.append("file", file); // attach the file to the form data
    const r = await fetch(`${BASE}/api/upload`, { method: "POST", body: fd });
    if (!r.ok) throw new Error("Upload failed"); // throw if server response not ok
    return r.json(); // parse and return JSON response
}
