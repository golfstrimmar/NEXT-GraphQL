import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Comment {
  id: number;
  text: string;
  userId: number;
  userName: string;
  messageId: number;
  likes: number;
  dislikes: number;
  createdAt: string;
}

interface UserReaction {
  id: number;
  userId: number;
  userName: string;
  commentId: number;
  reaction: "like" | "dislike";
}

interface CommentState {
  comments: Comment[];
  commentsLikedDisliked: UserReaction[];
  error: string | null;
}

const initialState: CommentState = {
  comments: [],
  commentsLikedDisliked: [],
  error: null,
};

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    setComments: (state, action: PayloadAction<Comment[]>) => {
      state.comments = action.payload;
      state.error = null;
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      state.comments.unshift(action.payload);
      state.error = null;
    },
    updateComment: (state, action: PayloadAction<Comment>) => {
      const index = state.comments.findIndex(
        (comment) => comment.id === action.payload.id
      );
      if (index !== -1) {
        state.comments[index] = action.payload;
        state.error = null;
      }
    },
    deleteComment: (state, action: PayloadAction<number>) => {
      state.comments = state.comments.filter(
        (comment) => comment.id !== action.payload
      );
      state.commentsLikedDisliked = state.commentsLikedDisliked.filter(
        (reaction) => reaction.commentId !== action.payload
      );
      state.error = null;
    },

    setCommentsLikedDisliked: (
      state,
      action: PayloadAction<UserReaction[]>
    ) => {
      state.commentsLikedDisliked = action.payload;
      state.error = null;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearComments: (state) => {
      state.comments = [];
      state.commentsLikedDisliked = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addComment, (state, action: PayloadAction<Comment>) => {
      state.comments.unshift(action.payload);
      state.error = null;
    });
  },
});

export const {
  setComments,
  addComment,
  updateComment,
  deleteComment,
  setCommentsLikedDisliked,
  setError,
  clearComments,
} = commentsSlice.actions;
export default commentsSlice.reducer;
