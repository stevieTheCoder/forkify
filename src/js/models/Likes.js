export default class Likes {
    constructor() {
        this.likes = [];
    }

    addLike(id, title, author, img) {
        const like = {
            id,
            title,
            author,
            img
        }
        this.like.push(like);
        return like;
    }

    deleteLike(id) {
        const index = this.likes.findIndex(cur => cur.id === id);
        this.likes.splice(index, 1);
    }

    isLiked(id) {
        return this.likes.find(cur => cur.id === id) !== -1;
    }

    getNumLikes() {
        return this.likes.length;
    }
}
