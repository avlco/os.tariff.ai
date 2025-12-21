import AdminAnalytics from './pages/AdminAnalytics';
import AdminCommunication from './pages/AdminCommunication';
import AdminCountryLinks from './pages/AdminCountryLinks';
import AdminDashboard from './pages/AdminDashboard';
import AdminFinancial from './pages/AdminFinancial';
import AdminReports from './pages/AdminReports';
import AdminUsers from './pages/AdminUsers';
import AdminShipments from './pages/AdminShipments';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminAnalytics": AdminAnalytics,
    "AdminCommunication": AdminCommunication,
    "AdminCountryLinks": AdminCountryLinks,
    "AdminDashboard": AdminDashboard,
    "AdminFinancial": AdminFinancial,
    "AdminReports": AdminReports,
    "AdminUsers": AdminUsers,
    "AdminShipments": AdminShipments,
}

export const pagesConfig = {
    mainPage: "AdminDashboard",
    Pages: PAGES,
    Layout: __Layout,
};