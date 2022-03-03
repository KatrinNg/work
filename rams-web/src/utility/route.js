import PatientDetail from 'pages/patientDetail/index.js';
import Calendar from 'pages/calendar'
import PatientSummary from 'pages/patientSummary/index.js';
import Dashboard from 'pages/dashboard/index.js';
import AdminMode from 'pages/adminMode/adminMode'
import Detail from 'pages/adminMode/detail'
import BatchMode from 'pages/batchMode/index.js'


const Placeholder = () => <div>Pending to implement</div>;

export const getDefaultRoute = (role) => {
    return [
        {
            component:Detail,
            path:'/adminMode/detail',
            name:'detail',
            exact:true,
            key:'detail',
        },
        {
            component:AdminMode,
            path:'/adminMode',
            name:'adminMode',
            exact:true,
            key:'adminMode',
        },
        {
            component: Dashboard,
            path: '/dashboard',
            name: 'Dashboard',
            exact: true,
            key: 'dashboard',
        },
        {
            component: PatientSummary,
            path: '/patientSummary',
            name: 'Patient Summary',
            exact: true,
            key: 'patientSummary',
        },
        {
            component: Calendar,
            path: '/calendar',
            name: 'Calendar',
            exact: true,
            key: 'calendar',
        },
        {
            component: PatientDetail,
            path: '/',
            name: 'Patient Details',
            exact: true,
            key: 'patientdetails',
        },
        {
            component: BatchMode,
            path: '/batchmode',
            name: 'Batch Mode',
            exact: true,
            key: 'batchmode',
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
