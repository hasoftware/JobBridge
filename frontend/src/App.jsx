import { lazy, Suspense, useEffect } from "react"
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import { ToastProvider } from "./hooks/useToast"
import { useAuth } from "./hooks/useAuth"
import Layout from "./components/layout/Layout"
import ToastContainer from "./components/common/Toast"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Login2FA from "./pages/Login2FA"
import Register from "./pages/Register"
import Onboarding from "./pages/Onboarding"
import VerifyEmail from "./pages/VerifyEmail"
import RegisterSuccess from "./pages/RegisterSuccess"
import Jobs from "./pages/Jobs"
// const Jobs = lazy(() => import('./pages/Jobs'))
import JobDetail from "./pages/JobDetail"
// const JobDetail = lazy(() => import('./pages/JobDetail'))
import CompanyPage from "./pages/CompanyPage"
// const CompanyPage = lazy(() => import('./pages/CompanyPage'))
const CVBuilder = lazy(() => import("./pages/CVBuilder"))
const CVTemplates = lazy(() => import("./pages/CVTemplates"))
const CoverLetterBuilder = lazy(() => import("./pages/CoverLetterBuilder"))
const MyCoverLetters = lazy(() => import("./pages/dashboard/MyCoverLetters"))
import Dashboard from "./pages/Dashboard"
// const Dashboard = lazy(() => import('./pages/Dashboard'))
const NotFound = lazy(() => import("./pages/NotFound"))
const ProfileSettings = lazy(() => import("./pages/dashboard/ProfileSettings"))
const SecuritySettings = lazy(() => import("./pages/dashboard/SecuritySettings"))
const NotificationSettings = lazy(() => import("./pages/dashboard/NotificationSettings"))
const SavedJobs = lazy(() => import("./pages/dashboard/SavedJobs"))
const MyCVs = lazy(() => import("./pages/dashboard/MyCVs"))
const MyApplications = lazy(() => import("./pages/dashboard/MyApplications"))
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"))
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"))
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"))
const EmailSettings = lazy(() => import("./pages/admin/EmailSettings"))

function PageLoader() {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%" }} />
        </div>
    )
}

const GUARD_EXEMPT = ["/onboarding", "/verify-email", "/oauth/callback", "/login", "/register"]

function GuestOnly({ children }) {
    const { isAuthenticated, isAdmin } = useAuth()
    if (isAuthenticated) {
        return <Navigate to={isAdmin ? "/admin" : "/"} replace />
    }
    return children
}

function AuthGuardRedirect() {
    const { user, isAuthenticated, isVerified } = useAuth()
    const navigate = useNavigate()
    const { pathname } = useLocation()

    useEffect(() => {
        if (!isAuthenticated || GUARD_EXEMPT.includes(pathname)) return

        if (!user?.role) {
            navigate("/onboarding", { replace: true })
        } else if (!isVerified) {
            navigate("/verify-email", { replace: true })
        }
    }, [isAuthenticated, user?.role, isVerified, pathname, navigate])

    return null
}

export default function App() {
    return (
        <ToastProvider>
            <AuthGuardRedirect />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="jobs" element={<Jobs />} />
                        <Route path="jobs/:id" element={<JobDetail />} />
                        <Route path="companies/:name" element={<CompanyPage />} />
                        <Route path="cv-templates" element={<CVTemplates />} />
                        <Route path="cv-builder" element={<CVBuilder />} />
                        <Route path="cover-letter-builder" element={<CoverLetterBuilder />} />
                        <Route path="login" element={<GuestOnly><Login /></GuestOnly>} />
                        <Route path="login/2fa" element={<GuestOnly><Login2FA /></GuestOnly>} />
                        <Route path="register" element={<GuestOnly><Register /></GuestOnly>} />
                        <Route path="onboarding" element={<Onboarding />} />
                        <Route path="verify-email" element={<VerifyEmail />} />
                        <Route path="register-success" element={<RegisterSuccess />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                    {/* Dashboard has its own layout (no navbar/footer) */}
                    <Route path="dashboard" element={<Dashboard />}>
                        <Route index element={<Navigate to="profile" replace />} />
                        <Route path="profile" element={<ProfileSettings />} />
                        <Route path="security" element={<SecuritySettings />} />
                        <Route path="notifications" element={<NotificationSettings />} />
                        <Route path="saved-jobs" element={<SavedJobs />} />
                        <Route path="cvs" element={<MyCVs />} />
                        <Route path="applied-jobs" element={<MyApplications />} />
                        <Route path="cover-letters" element={<MyCoverLetters />} />
                    </Route>
                    <Route path="admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="settings/email" element={<EmailSettings />} />
                    </Route>
                    <Route path="oauth/callback" element={<OAuthCallback />} />
                </Routes>
            </Suspense>
            <ToastContainer />
        </ToastProvider>
    )
}
