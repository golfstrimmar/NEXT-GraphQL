export type PostType = {
  id: string;
  title: string;
  text: string;
  category: string;
  createdAt: string;
  likes: string[];
  dislikes: string[];
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
