import Room from 'pages/room/Room.js';
import Login from 'pages/login/index.js';
import Home from 'pages/home/index.js';
import Detail from 'pages/detail';
// import Scan from 'pages/scan/index';
import scene from 'pages/scene/sceneSituation';
import Group from 'pages/group';
import Activity from 'pages/activity/index.js'
// import GroupDetail from 'pages/groupDetail/groupDetail';
import Treatment from 'pages/detail/treatment/treatment';
import EnterCase from 'pages/detail/enterCase.js';

export const getDefaultRoute = (role) => {
    return [
        // {
        //     component: Login,
        //     path: '/',
        //     name: 'Login',
        //     exact: true,
        //     key: 'LoginPage',
        // },
        // {
        //     component: GroupDetail,
        //     path: '/groupdetail',
        //     name: 'GroupDetail',
        //     exact: true,
        //     key: 'GroupDetail',
        // },
        {
            component: Group,
            path: '/group',
            name: 'Group',
            exact: true,
            key: 'Group',
        },
        {
            component: Home,
            path: '/home',
            name: 'home',
            exact: true,
            key: 'home',
        },
        {
            component: scene,
            path: '/scene',
            name: 'SceneSituation',
            exact: true,
            key: 'SceneSituation',
        },
        {
            component: Detail,
            path: '/detail',
            name: 'PatientDetails',
            exact: true,
            key: 'PatientDetails',
        },
        {
            component: Room,
            path: '/room',
            name: 'Room',
            exact: true,
            key: 'Room',
        },
        // {
        //     component: Scan,
        //     path:'/scan',
        //     name: 'Scan',
        //     exact: true,
        //     key: 'Scan'
        // },
        {
            component: Activity,
            path:'/activity',
            name: 'Activity',
            exact: true,
            key: 'Activity'
        },
        {
            component: Treatment,
            path:'/treatment',
            name: 'Treatment',
            exact: true,
            key: 'Treatment'
        },
        {
            component: EnterCase,
            path:'/enterCase',
            name: 'EnterCase',
            exact: true,
            key: 'EnterCase'
        },
        {
            component: () => <div>404 Not found</div>,
            path: '*',
            name: '404',
            exact: true,
            key: '404',
        },
    ];
};

export const getCombineRoute = (menu) => {
    // role is mandatory for the routing;
    // if (!role) {
    //     return [];
    // }

    const formattedRoute = [];

    formattedRoute.push(...getDefaultRoute());

    return formattedRoute;
};
