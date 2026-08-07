import { SYSTEM_PATHS } from "@/lib/system-config";

export const MEDIA_CONFIG = {
  musicDirectory: SYSTEM_PATHS.music,
  musicExtension: ".mp3",
  glyphs: {
    music: "\uF001",
    previous: "\uF048",
    play: "\uF04B",
    pause: "\uF04C",
    next: "\uF051",
    mute: "\uF026",
    volume: "\uF028",
  },
} as const;
