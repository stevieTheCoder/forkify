import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader, elementStrings } from './views/base';

//Global state of the app
//search object
//current recipe
//shopping list
//liked recipes
const state = {};

/**
 * Search controller
 */
const controlSearch = async () => {
    // get query from view
    const query = searchView.getInput();

    if (query) {
        //new search object and add to state
        state.search = new Search(query);

        //Prepare UI for result
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            //Search recipes
            await state.search.getResults();

            //Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch(err) {
            console.log(err);
            clearLoader();
        }
    }
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }   
});

/**
 *  Recipe controller
 */
const controlRecipe = async () => {
    //get id from url
    const id = window.location.hash.replace('#', '');

    if (id) {
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected search item
        if (state.search) searchView.highlightSelected(id);

        //Create new recipe
        state.recipe = new Recipe(id);

        try {
            //Get recipe and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
    
            //Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));

        } catch (err) {
            alert('Error processing recipe');
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/*
* LIST CONTROLLER
*/
const controlList = () => {
    // create a new list if there is none yet
    if (!state.list) state.list = new List();

    //Add each incregient to the list and UI
    state.recipe.ingredients.forEach(cur => {
        const item = state.list.addItem(cur.count, cur.unit, cur.ingredient);        
        listView.renderItem(item);
    });    
}

// Handle delete and update list item events
elements.shoppingList.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle delete button click
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state and UI
        state.list.deleteItem(id);
        listView.deleteItem(id);

    //Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value);
        
        if (val < 0) {
            e.target.value = `${state.list.items.find(cur => cur.id === id).count}`;
            return;
        } else {
            state.list.changeCount(id, val);
        }        
    }
});

/**
 * LIKE CONTROLLER
 */
//just for testing
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    
    //If recipe not yet liked
    if (!state.likes.isLiked(currentID)) {
        //Add like to the state
        const newLike = state.likes.addLike(currentID, 
            state.recipe.title, 
            state.recipe.author, 
            state.recipe.img);

        //Toggle like button
            likesView.toggleLikedBtn(true);
        //Add to UI
        likesView.renderLike(newLike);

    //if recipe is currently liked
    } else {
        //Remove from state
        state.likes.deleteLike(currentID);
        //Toggle like button
        likesView.toggleLikedBtn(false);
        //Remove like from UI
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //if recipe is not liked
};

// Restore liked recipes on page load
window.addEventListener('load', e => {
    state.likes = new Likes();

    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }        
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        //Add shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //Like controller
        controlLike();
    }
});
