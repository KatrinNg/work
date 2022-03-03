// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './App.js';
// import * as serviceWorker from './serviceWorker';
// import {start} from 'single-spa';
// import * as spaHelper from './spaHelper';
// import {globalEventDistributor} from './globalEventDistributor';

// ReactDOM.render(<App />, document.getElementById('root'));

// const init = async () => {
//   spaHelper.loadApp('F120',  '/index/patientSpecFunction/F120/immuHistSingleSpaEntry.js', '/index/patientSpecFunction/F120/immunisationStore.js', globalEventDistributor);
//   spaHelper.loadApp('F121',  '/index/patientSpecFunction/F121/vaccinationSingleSpaEntry.js', '/index/patientSpecFunction/F121/vaccinationStore.js', globalEventDistributor);
//   spaHelper.loadApp('F122',  '/index/F122/vaccMgtSingleSpaEntry.js', '/index/F122/vaccManagementStore.js', globalEventDistributor);
//   spaHelper.loadApp('F110',  '/index/F110/singleSpaEntry.js', '/index/F110/store.js', globalEventDistributor);
//   spaHelper.loadApp('F109', '/index/F109/singleSpaEntry.js', '/index/F109/store.js', globalEventDistributor);
// };

// init().then(()=>{
//   start();
//   serviceWorker.unregister();
// });

import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import App from './app';
import {start} from 'single-spa';

import components from './formioCustom/components';
import templates from './formioCustom/templates';

import { Formio } from 'formiojs';

const formioPlugin = {components, templates};

Formio.use(formioPlugin);

ReactDOM.render(<App />,document.getElementById('root'));
document.title = 'CIMS';
start();
serviceWorker.unregister();