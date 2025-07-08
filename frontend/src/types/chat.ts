export interface Chat {
  id: number;
  createdAt: string;
  creator: { id: number; name: string };
  participant: { id: number; name: string };
  messages: {
    id: number;
    text: string;
    sender: { id: number; name: string };
  }[];
}
