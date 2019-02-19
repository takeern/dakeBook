import Home from './component/Home.jsx';
import Read from './component/Read';

const routes = [
    {
        path: '/',
        component: Home,
        exact: true,
    },
    {
        path: '/read',
        component: Read,
        exact: true,
    },
];

export default routes;