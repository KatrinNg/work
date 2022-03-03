import React from 'react';
import CIMSRouter from './cimsRouter';
import './index.css';
import { Provider } from 'react-redux';
import storeConfig from './store/storeConfig';
import { PersistGate } from 'redux-persist/integration/react';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from './theme';

import CIMSMessageDialog from './components/Dialog/CIMSMessageDialog';
import MessageSnackbar from './components/Snackbar/MessageSnackbar/MessageSnackbar';
import CommonCircular from './views/compontent/commonProgress/commonCircular';
import CommonErrorDialog from './views/compontent/commonDialog/commonErrorDialog';
import './styles/ag-theme-balham/sass/ag-theme-balham.scss';

export default function App() {
  return (
    <Provider store={storeConfig.store}>
      <PersistGate loading={null} persistor={storeConfig.persistor}>
        <MuiThemeProvider theme={theme}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <CIMSRouter />
            <CIMSMessageDialog />
            <MessageSnackbar />
            <CommonErrorDialog />
            <CommonCircular />
          </MuiPickersUtilsProvider>
        </MuiThemeProvider>
      </PersistGate>
    </Provider>
  );
}
