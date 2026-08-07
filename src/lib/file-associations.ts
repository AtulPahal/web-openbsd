import type { AppId } from "@/types";

export type FileAssociationAppId = Extract<AppId, "text-editor" | "music" | "video">;

export const FILE_ASSOCIATIONS: Readonly<Record<string, Exclude<FileAssociationAppId, "text-editor">>> = {
  ".mp3": "music",
  ".wav": "music",
  ".ogg": "music",
  ".mp4": "video",
  ".webm": "video",
  ".mov": "video",
};

export const DEFAULT_FILE_ASSOCIATION: FileAssociationAppId = "text-editor";

export function getFileAssociation(fileName: string): FileAssociationAppId {
  const extensionStart = fileName.lastIndexOf(".");
  const extension = extensionStart >= 0 ? fileName.slice(extensionStart).toLowerCase() : "";
  return FILE_ASSOCIATIONS[extension] ?? DEFAULT_FILE_ASSOCIATION;
}
