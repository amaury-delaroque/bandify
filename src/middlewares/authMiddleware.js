import axios from 'axios';

const authMiddleware = (store) => (next) => (action) => {
  const state = store.getState();
  if (action.type === 'GET_INIT') {
    // get the token
    const token = localStorage.getItem('token');
    // if we had one send a request to the serveur
    // BY taking away, in passing the "timbre" (headers : x-acces-token)
    if (token && token !== undefined) {
      axios.post(`${process.env.BANDIFY_API_URL}/checkToken`, {
        headers: {
          'x-acces-token': localStorage.getItem('token'),
        },
      })
        .then((response) => {
          // Create an objet user, to stay connected
          if (response) {
            const user = {
              id: localStorage.getItem('userId'),
              email: localStorage.getItem('userEmail'),
              token: localStorage.getItem('token'),
            };
            store.dispatch({ type: 'RECONNECT_USER', user });
            store.dispatch({ type: 'SET_INIT' });
          }
        })
        .catch(() => {
          localStorage.clear();
          store.dispatch({ type: 'SET_INIT' });
        }).then(() => {
          store.dispatch({ type: 'SET_INIT' });
        });
    }
  }
  if (action.type === 'ON_LOGIN_SUBMIT') {
    // We start by taking a snapshot of the state
    // in which we will pick email and password

    const options = {
      method: 'POST',
      url: `${process.env.BANDIFY_API_URL}/login`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        // pincking in the state what we need
        email: state.login.email,
        user_password: state.login.password,
      },
    };

    axios(options)
      .then((response) => {
        // ON clear the localstorage in case 
        localStorage.clear();
        //  STOCKing(setItem) user informations + token
        localStorage.setItem('userId', response.data.id);
        localStorage.setItem('userEmail', response.data.email);
        localStorage.setItem('token', response.data.token);
        store.dispatch({ type: 'ON_LOGIN_SUCCESS', data: response.data });
      })
      .catch((e) => {
        store.dispatch({ type: 'ON_LOGIN_ERROR', e });
      });
  }

  else {
    next(action);
  }
};

export default authMiddleware;
