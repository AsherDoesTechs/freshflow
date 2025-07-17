const clientId = "20096e5384b746c6b692757222a50836";
const clientSecret = "e379ba2732854836bd543f7faf9547fb";

export async function getAccessToken() {
  const encoded = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${encoded}`,
      "Content-Type": `application/x-www-form-urlencoded`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}
