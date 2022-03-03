import React from "react";
import VisitInfoFormPublic from "../form/VisitInfoFormPublic";
import ResultQRCodePage from "../resultQrCode";
import { Switch, Router, Route, Redirect } from "react-router-dom";

import LayoutPublic from "../../components/Layout/LayoutPublic";

const PublicEntryPage = ({history})=> {
    return (
        <Router history={history}>
            <LayoutPublic>
                <Switch>
                    <Route exact path="/public/inputVisitInfo" component={VisitInfoFormPublic} />
                    <Route exact path="/" component={VisitInfoFormPublic} />
                    <Route exact path="/public/resultQRCode" component={ResultQRCodePage}/>
                    <Redirect from="*" to="/" />
                </Switch>
            </LayoutPublic>
        </Router>
    );
}

export default PublicEntryPage;
