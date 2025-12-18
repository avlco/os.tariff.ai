import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import AdminAnalytics from './pages/AdminAnalytics';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "AdminUsers": AdminUsers,
    "AdminReports": AdminReports,
    "AdminAnalytics": AdminAnalytics,
}

export const pagesConfig = {
    mainPage: "AdminDashboard",
    Pages: PAGES,
};