import axios from 'axios';

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() {
        try {
            const res = await axios(`https://www.food2fork.com/api/search?key=${process.env.API_KEY}&q=${this.query}`);
        this.result = res.data.recipes;
        } catch (error) {
            console.log(error);
        }       
    }
}

