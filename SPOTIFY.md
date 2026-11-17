# Wiring the Spotify "now playing" widget

The site already has the widget and the API route. It renders **nothing** until
three environment variables exist, so it can never ship a broken box.

## 1. Create a Spotify app

1. Go to <https://developer.spotify.com/dashboard> → **Create app**.
2. Name it anything (e.g. `emerald-portfolio`).
3. Add this redirect URI: `http://localhost:3000/callback`
4. Save, then copy the **Client ID** and **Client Secret**.

## 2. Get a refresh token (once)

Open this URL in a browser, replacing `YOUR_CLIENT_ID`:

```
https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000/callback&scope=user-read-currently-playing%20user-read-recently-played
```

Approve it. You'll land on `http://localhost:3000/callback?code=...`, the page
itself doesn't matter, copy the `code` from the address bar. It expires in ~10
minutes, so use it immediately:

```bash
curl -X POST https://accounts.spotify.com/api/token \
  -H "Authorization: Basic $(printf 'CLIENT_ID:CLIENT_SECRET' | base64)" \
  -d grant_type=authorization_code \
  -d code=THE_CODE_FROM_THE_URL \
  -d redirect_uri=http://localhost:3000/callback
```

The JSON response has a `refresh_token`. **This one doesn't expire**, it's the
only value you need to keep.

## 3. Add the environment variables in Vercel

| Variable | Value |
| --- | --- |
| `SPOTIFY_CLIENT_ID` | from step 1 |
| `SPOTIFY_CLIENT_SECRET` | from step 1 |
| `SPOTIFY_REFRESH_TOKEN` | from step 2 |

Redeploy. The widget appears in the hero and in the band above Process, and
switches to "last played" when nothing is on.

## Notes

- The API route (`app/api/spotify/now-playing/route.ts`) refreshes the access
  token on every request; the token never reaches the browser.
- Requests are `no-store`, and the client polls every 30 seconds and pauses
  while the tab is hidden.
- If Spotify is down or the token is revoked, the route returns an error and
  the widget simply stays hidden.
- Listening history is private-by-default territory: this exposes only the
  current track's title, artist, art and a link. Nothing else is stored.
