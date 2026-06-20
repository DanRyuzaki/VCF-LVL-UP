/**
 * Converts a regular YouTube / Facebook / Twitch URL into its embeddable
 * iframe src, and returns platform-specific iframe attributes.
 *
 * Supported URL patterns:
 *   YouTube  - youtube.com/watch?v=ID, youtu.be/ID, youtube.com/live/ID
 *   Facebook - facebook.com/page/videos/ID, fb.watch/ID
 *   Twitch   - twitch.tv/CHANNEL, twitch.tv/videos/ID
 */

export type EmbedPlatform = "youtube" | "facebook" | "twitch" | "unknown";

export interface EmbedResult {
  embedUrl: string | null;
  platform: EmbedPlatform;
}

/* ─── YouTube ──────────────────────────────────────────────────────────────── */

function tryYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");

    // youtube.com/watch?v=ID
    if ((host === "youtube.com" || host === "m.youtube.com") && u.pathname === "/watch") {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }

    // youtube.com/embed/ID (already an embed URL)
    if (host === "youtube.com" && u.pathname.startsWith("/embed/")) {
      const id = u.pathname.split("/embed/")[1]?.split(/[?#/]/)[0];
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }

    // youtube.com/live/ID
    if (host === "youtube.com" && u.pathname.startsWith("/live/")) {
      const id = u.pathname.split("/live/")[1]?.split(/[?#/]/)[0];
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }

    // youtu.be/ID
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split(/[?#/]/)[0];
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
    }
  } catch {
    // invalid URL
  }
  return null;
}

/* ─── Facebook ─────────────────────────────────────────────────────────────── */

function tryFacebookEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");

    // facebook.com/*/videos/ID  or  facebook.com/video/...
    if (host === "facebook.com" && /video/i.test(u.pathname)) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`;
    }

    // fb.watch/ID
    if (host === "fb.watch") {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`;
    }

    // facebook.com page with /live or general facebook links
    if (host === "facebook.com") {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`;
    }
  } catch {
    // invalid URL
  }
  return null;
}

/* ─── Twitch ───────────────────────────────────────────────────────────────── */

function tryTwitchEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");

    if (host !== "twitch.tv") return null;

    // Parent domain needed for Twitch embeds (use current hostname at runtime)
    const parentDomain =
      typeof window !== "undefined" ? window.location.hostname : "localhost";

    // twitch.tv/videos/ID
    if (u.pathname.startsWith("/videos/")) {
      const videoId = u.pathname.split("/videos/")[1]?.split(/[?#/]/)[0];
      if (videoId) {
        return `https://player.twitch.tv/?video=${videoId}&parent=${parentDomain}&autoplay=true`;
      }
    }

    // twitch.tv/CHANNEL (live stream)
    const channel = u.pathname.slice(1).split(/[?#/]/)[0];
    if (channel) {
      return `https://player.twitch.tv/?channel=${channel}&parent=${parentDomain}&autoplay=true`;
    }
  } catch {
    // invalid URL
  }
  return null;
}

/* ─── Public API ───────────────────────────────────────────────────────────── */

/**
 * Detect the platform from the URL string (without relying on the stored `platform` field).
 */
export function detectPlatform(url: string): EmbedPlatform {
  try {
    const host = new URL(url).hostname.replace("www.", "");
    if (["youtube.com", "m.youtube.com", "youtu.be"].includes(host)) return "youtube";
    if (["facebook.com", "fb.watch"].includes(host))                return "facebook";
    if (host === "twitch.tv")                                       return "twitch";
  } catch {
    // invalid
  }
  return "unknown";
}

/**
 * Convert any YouTube / Facebook / Twitch URL into an embeddable src.
 */
export function getEmbedUrl(url: string, platformHint?: string): EmbedResult {
  const platform = (platformHint?.toLowerCase() as EmbedPlatform) || detectPlatform(url);

  switch (platform) {
    case "youtube": {
      const embedUrl = tryYouTubeEmbed(url);
      return { embedUrl, platform: "youtube" };
    }
    case "facebook": {
      const embedUrl = tryFacebookEmbed(url);
      return { embedUrl, platform: "facebook" };
    }
    case "twitch": {
      const embedUrl = tryTwitchEmbed(url);
      return { embedUrl, platform: "twitch" };
    }
    default: {
      // Try each parser as fallback
      const yt = tryYouTubeEmbed(url);
      if (yt) return { embedUrl: yt, platform: "youtube" };
      const fb = tryFacebookEmbed(url);
      if (fb) return { embedUrl: fb, platform: "facebook" };
      const tw = tryTwitchEmbed(url);
      if (tw) return { embedUrl: tw, platform: "twitch" };
      return { embedUrl: null, platform: "unknown" };
    }
  }
}
