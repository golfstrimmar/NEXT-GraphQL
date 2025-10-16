export default interface FProject {
  id: string;
  name: string;
  fileKey: string;
  nodeId: string;
  token: string;
  file: Record<string, any>; // JSON-структура из Figma
  previewUrl?: string | null;
  owner: User;
  figmaImages: FigmaImage[];
}
