import { HashRouter as Router, Switch, Route, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { getCombineRoute } from 'utility/route';
import Message from 'components/Message/Message';
import MainContainer from 'pages/MainContainer';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import * as ActionTypes from 'redux/actionTypes';
import { getCookie } from './utility/utils';

const MainRouter = () => {
    const combineRoute = getCombineRoute();
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const history = useHistory()
    const { g_loginInfo, g_errorText, g_isLogin } = useSelector(
        (state) => {
            return {
                g_errorText: state.global.errorText,
                g_isLogin: state.global.isLogin,
                g_loginInfo: state.global.loginInfo,
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
        if (!g_isLogin) {
            const commonKey = getCookie('cms-common-cache-key');
            const cacheKey = commonKey ? commonKey : 'b8e29f742b9e64c8fdb6113bb96d07db9b2d95a7edce5f2ec9e9aaf24149ad49';
            setTimeout(() => {
                dispatch(
                    {
                        type: ActionTypes.FETCH_BASIC_INFO,
                        payload: {
                            cacheKey,
                        }
                    })
            }, 2000)
        }
    }, [])

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
                style={{width: '95%'}} 
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
                    {
                        g_isLogin ? 
                            combineRoute.map((route, index) => {
                                const Content = route.component;

                                let path = route.path;

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
                                        <Content />
                                    </Route>
                                );
                            }) : null
                    }
                </Switch>
                {/* <Route
                    path="/"
                    key="container"
                    render={(props) => <MainContainer {...props} />}
                /> */}
            </Router>
            <Message />
        </>
    );
};

export default MainRouter;
