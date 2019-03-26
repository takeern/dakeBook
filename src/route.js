import View from './component/View.jsx';
import Read from './component/Read';
import Search from './component/SearchBook';

const routes = [
    {
        path: '/',
        component: View,
        exact: false,
        routes: [
            {
                path: '/read',
                component: Read,
                exact: true,
            },
            {
                path: '/search',
                component: Search,
                exact: true,
            },
        ],
    },
];

export default routes;