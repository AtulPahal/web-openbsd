import type { ElementType } from "react";
import {
  Activity,
  AudioLines,
  Clapperboard,
  FileText,
  Folder,
  Globe,
  Info,
  Terminal,
} from "lucide-react";

/** Lucide icons used by the applications registered in the desktop. */
export const APP_ICON_MAP: Record<string, ElementType> = {
  Terminal,
  Folder,
  FileText,
  Activity,
  Info,
  Globe,
  AudioLines,
  Clapperboard,
};
