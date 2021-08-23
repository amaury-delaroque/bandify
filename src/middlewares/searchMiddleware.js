import axios from 'axios';

const searchMiddleware = (store) => (next) => (action) => {
  if (action.type === 'GET_INSTRUMENTS') {
    axios.get('http://localhost:3000/instruments')
      .then((response) => {
        store.dispatch({ type: 'GET_INSTRUMENTS_SUCCESS', instruments: response.data });
      });
  }

  if (action.type === 'GET_LEVELS') {
    axios.get('http://localhost:3000/levels')
      .then((response) => {
        store.dispatch({ type: 'GET_LEVELS_SUCCESS', levels: response.data });
      });
  }

  if (action.type === 'GET_MUSIC_STYLES') {
    axios.get('http://localhost:3000/musicstyles')
      .then((response) => {
        store.dispatch({ type: 'GET_MUSIC_STYLES_SUCCESS', musicstyles: response.data });
      });
  }

  if (action.type === 'ON_SEARCH_SUBMIT') {
    const state = store.getState();
    // value de la searchBar, stockée dans le reducer settings
    const { searchValue } = state.settings;
    const searchMessage = `Résultats pour ${searchValue}`;

    axios.get(`http://localhost:3000/search?q=${searchValue}`)
      .then((response) => {
        // on dispatch les users recherchés (et filtrés) dans le User reducer
        // afin que ces derniers remplacent l'array contenant tous les users provenant de la bdd
        store.dispatch({ type: 'ON_SEARCH_SUBMIT_SUCCESS', searchedUsers: response.data, searchMessage });
      });
  }

  // Si on a cliqué sur Réinitialiser dans la searchBar, on dispatch au reducer.
  // Les users ne sont plus filtrés et on récupère de nouveau TOUS les users via l'api
  if (action.type === 'ON_RESET_FILTERS') {
    axios.get('http://localhost:3000/members')
      .then((response) => {
        store.dispatch({ type: 'GET_MEMBERS_SUCCESS', users: response.data });
      });
  }

  next(action);
};

export default searchMiddleware;
