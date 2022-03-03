import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { getCombineRoute } from 'utility/route';
import Login from 'pages/login/index.js';
import HeaderMenu from 'components/HeaderMenu/HeaderMenu';
import cookie from 'storage/cookie';
import { useSelector, useDispatch } from 'react-redux';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import * as ActionTypes from 'redux/actionTypes';

const MainRouter = () => {
    const combineRoute = getCombineRoute();
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const { loginInfo, g_errorText } = useSelector(
        (state) => {
            return {
                g_errorText: state.global.errorText,
                loginInfo: state.loginInfo,
            }
        }
    );

    const handleCloseTips = () => {
        dispatch({
            type: ActionTypes.SHOW_ERROR_TIPS,
            payload: {
                errorText: ''
            }
        })
    }

    useEffect(() => {
        setIsOpen(Boolean(g_errorText))
    }, [g_errorText])

    return (
        <>
            <Snackbar anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={isOpen}
                autoHideDuration={3000}
                onClose={handleCloseTips}>
                <Alert 
                    style={{width: '100%'}} 
                    icon={false} variant="filled" severity="error"
                    onClose={handleCloseTips}
                >{g_errorText}</Alert>
            </Snackbar>
            <Router>
                <Switch>
                    <Route exact path="/" render={() => <Redirect to="/login" />} />
                    <Route key={`LoginPage`} path={`/login`}>
                        <Login name={'login'} />
                    </Route>
                   

                    
                    {combineRoute.map((route, index) => {
                        const Content = route.component;

                        let path = route.path;
                        const user = cookie.getCookie('user');
                        if (!user) return <Redirect to="/login" />
                        
                        // case when sub routing exist
                        if (route.subRoute?.length >= 1) {
                            return route.subRoute.map((item) => {
                                const SubRouteComponent = item.component;

                                return (
                                    <Route key={`${path}-${item.path}`} path={`${path}${item.path}`}>
                                        <SubRouteComponent name={item.name} />
                                    </Route>
                                );
                            });
                        }
                    

                        // case without sub routing
                        return (
                            <Route key={`${index}-${route.path}`} path={route.path} exact={route.exact}>
                                <HeaderMenu content={<Content />} />
                            </Route>
                        );
                    })}
                      
                    
                </Switch>
                {/* <Route
                    path="/"
                    key="container"
                    render={(props) => <MainContainer {...props} />}
                /> */}
            </Router>
        </>
    );
};

export default MainRouter;
