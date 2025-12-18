import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "AdminUsers": AdminUsers,
    "AdminReports": AdminReports,
}

export const pagesConfig = {
    mainPage: "AdminDashboard",
    Pages: PAGES,
};