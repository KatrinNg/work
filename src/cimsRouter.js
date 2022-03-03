import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { HashRouter as Router } from 'react-router-dom';
import useStyles from './theme/styles';

import Login from './views/login/login';
import ForgetPassword from './views/forgetPassword/forgetPassword';
import ForceLogin from './views/login/forceLogin';
import IndexWarp from './layout/index';
// import IndexMoe from './layout/indexMoe';
import ADIWebClientForm from './views/registration/component/adiWebClientForm';
import ADICallback from './utilities/adiCallbackUtilities';
import ImageViewer from '../src/views/jos/ImageViewer/ImageViewer.js';

export default function CIMSRouter() {
  useStyles();
  return (
    <Router>
      <Switch>
        {/* <Route path="/login/:serviceCd?/:clinicCd?" component={IndexMoe} strict /> */}
        <Route path="/login" component={Login} strict />
        <Route path="/forceLogin" component={ForceLogin} strict />
        <Redirect exact from="/" to="/login" />
        <Route path="/forgetPassword" component={ForgetPassword} />
        <Route path="/index" component={IndexWarp} />
        <Route path="/adi/:url/:json">
          <ADIWebClientForm />
        </Route>
        <Route path="/adiCallback">
          <ADICallback />
        </Route>
        <Route path="/imageViewer" component={ImageViewer} strict/>
        <Route exact path="/ideasReadcard" render={() => { window.location.href = '/smartcard/readcard_ui.html'; }} />
        <Route exact path="/ideasCheckcard" render={() => { window.location.href = '/smartcard/checkcard.html'; }} />
        <Route exact path="/ideasDummy" render={() => { window.location.href = '/smartcard/ideas2_result.html'; }} />
      </Switch>
    </Router>
  );
}
