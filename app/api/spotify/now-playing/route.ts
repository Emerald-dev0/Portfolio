import { NextResponse } from "next/server";

/**
 * GET /api/spotify/now-playing
 * ---------------------------------------------------------------------------
 * What I'm playing right now, straight from Spotify.
 *
 * Set these three env vars in Vercel and it lights up. Without them the route
 * answers 501 and the widget renders nothing at all, no empty box, no lie.
 *
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_CLIENT_SECRET
 *   SPOTIFY_REFRESH_TOKEN      (scope: user-read-currently-playing user-read-recently-played)
 *
 * How to get the refresh token, once: create an app at
 * developer.spotify.com/dashboard, add http://localhost:3000/callback as a
 * redirect URI, open the authorize URL with the two scopes above, then POST the
 * returned `code` to https://accounts.spotify.com/api/token with
 * grant_type=authorization_code. The response's refresh_token never expires.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_URL =
  "https://api.spotify.com/v1/me/player/currently-playing?additional_types=track";
const RECENT_URL =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

type Track = {
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string; width: number }[] };
  external_urls: { spotify: string };
  duration_ms: number;
};

type NowPlaying = {
  configured: true;
  playing: boolean;
  title: string;
  artist: string;
  album: string;
  art: string | null;
  url: string;
  progressMs: number;
  durationMs: number;
};

function env() {
  return {
    id: process.env.SPOTIFY_CLIENT_ID ?? "",
    secret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
    refresh: process.env.SPOTIFY_REFRESH_TOKEN ?? "",
  };
}

async function accessToken() {
  const { id, secret, refresh } = env();
  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Spotify token refresh failed");
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

function shape(track: Track, playing: boolean, progressMs = 0): NowPlaying {
  const art = [...(track.album.images ?? [])].sort((a, b) => b.width - a.width);
  return {
    configured: true,
    playing,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    art: art[0]?.url ?? null,
    url: track.external_urls.spotify,
    progressMs,
    durationMs: track.duration_ms,
  };
}

export async function GET() {
  const { id, secret, refresh } = env();
  if (!id || !secret || !refresh) {
    return NextResponse.json(
      { configured: false, error: "Spotify is not configured." },
      { status: 501 },
    );
  }

  try {
    const token = await accessToken();
    const headers = { Authorization: `Bearer ${token}` };

    const nowRes = await fetch(NOW_URL, { headers, cache: "no-store" });
    if (nowRes.status === 200) {
      const data = (await nowRes.json()) as {
        is_playing: boolean;
        progress_ms: number;
        item: Track | null;
      };
      if (data?.item) {
        return NextResponse.json(shape(data.item, data.is_playing, data.progress_ms), {
          headers: { "Cache-Control": "no-store" },
        });
      }
    }

    // Nothing playing, fall back to the last thing that was.
    const recentRes = await fetch(RECENT_URL, { headers, cache: "no-store" });
    if (recentRes.ok) {
      const data = (await recentRes.json()) as { items: { track: Track }[] };
      const track = data.items?.[0]?.track;
      if (track) {
        return NextResponse.json(shape(track, false), {
          headers: { "Cache-Control": "no-store" },
        });
      }
    }

    return NextResponse.json({ configured: true, playing: false, empty: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { configured: true, error: "Could not reach Spotify." },
      { status: 502 },
    );
  }
}
