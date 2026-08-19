import type { ElementType } from "react";
import {
  Activity,
  AudioLines,
  Brain,
  Calendar,
  Clapperboard,
  FileText,
  Folder,
  Globe,
  Info,
  Settings,
  Terminal,
  User,
} from "lucide-react";
import { KittyIcon } from "@/lib/social-icons";

/** Lucide and custom vector icons used by the applications registered in the desktop. */
export const APP_ICON_MAP: Record<string, ElementType> = {
  Terminal: KittyIcon,
  Kitty: KittyIcon,
  Folder,
  FileText,
  Activity,
  Info,
  Globe,
  AudioLines,
  Clapperboard,
  User,
  Calendar,
  Settings,
  Brain,
};
