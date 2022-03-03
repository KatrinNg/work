import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import App from './app';

// const { persistor, store } = configure({});

ReactDOM.render(<App />,document.getElementById('root'));
document.title = 'CIMS';
serviceWorker.unregister();