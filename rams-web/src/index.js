import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from "@material-ui/styles";
import { CssBaseline } from "@material-ui/core";
import { Provider } from 'react-redux';
import store from './redux/store.js';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Themes from "./themes";

// t
ReactDOM.render(
  <>
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Provider store={store}>
        <ThemeProvider theme={Themes.default}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </Provider>
    </MuiPickersUtilsProvider>
  </>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
