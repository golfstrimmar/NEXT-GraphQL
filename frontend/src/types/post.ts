export type PostType = {
  id: string;
  text: string;
  category: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  currentUserReaction: "LIKE" | "DISLIKE" | null;
  creator: {
    id: string;
    name: string;
  };
  comments: {
    id: string;
    text: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
    };
  }[];
};
