import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import "../../assets/css/App.css";
import PublicEntryPage from "../../pages/main/PublicEntryPage";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={PublicEntryPage} />
        {/*<Redirect exact from="/" to="/public/inputVisitInfo" />*/}
      </Switch>
    </Router>
  );
}

export default App;
