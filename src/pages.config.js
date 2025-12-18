import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminFinancial from './pages/AdminFinancial';
import AdminCommunication from './pages/AdminCommunication';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "AdminUsers": AdminUsers,
    "AdminReports": AdminReports,
    "AdminAnalytics": AdminAnalytics,
    "AdminFinancial": AdminFinancial,
    "AdminCommunication": AdminCommunication,
}

export const pagesConfig = {
    mainPage: "AdminDashboard",
    Pages: PAGES,
};