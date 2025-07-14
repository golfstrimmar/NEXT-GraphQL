export type CommentType = {
    id: string;
    text: string;
    createdAt: string;
    postId: string;
    user: {
        id: string;
        name: string;
    };
    commentLikes: {
        id: string;
        user: {
            id: string;
            name: string;
        };
    }[];
    commentDislikes: {
        id: string;
        user: {
            id: string;
            name: string;
        };
    }[];
};
