import { lazy, Suspense, useEffect } from "react"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { ToastProvider } from "./hooks/useToast"
import { useAuth } from "./hooks/useAuth"
import Layout from "./components/layout/Layout"
import ToastContainer from "./components/common/Toast"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Onboarding from "./pages/Onboarding"
import VerifyEmail from "./pages/VerifyEmail"
import Jobs from "./pages/Jobs"
// const Jobs = lazy(() => import('./pages/Jobs'))
import JobDetail from "./pages/JobDetail"
// const JobDetail = lazy(() => import('./pages/JobDetail'))
import CompanyPage from "./pages/CompanyPage"
// const CompanyPage = lazy(() => import('./pages/CompanyPage'))
const CVBuilder = lazy(() => import("./pages/CVBuilder"))
import Dashboard from "./pages/Dashboard"
// const Dashboard = lazy(() => import('./pages/Dashboard'))
const NotFound = lazy(() => import("./pages/NotFound"))
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"))

function PageLoader() {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%" }} />
        </div>
    )
}

const GUARD_EXEMPT = ["/onboarding", "/verify-email", "/oauth/callback", "/dang-nhap", "/dang-ky"]

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
                        <Route path="viec-lam" element={<Jobs />} />
                        <Route path="viec-lam/:id" element={<JobDetail />} />
                        <Route path="cong-ty/:name" element={<CompanyPage />} />
                        <Route path="tao-cv" element={<CVBuilder />} />
                        <Route path="dang-nhap" element={<Login />} />
                        <Route path="dang-ky" element={<Register />} />
                        <Route path="onboarding" element={<Onboarding />} />
                        <Route path="verify-email" element={<VerifyEmail />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                    {/* Dashboard has its own layout (no navbar/footer) */}
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="oauth/callback" element={<OAuthCallback />} />
                </Routes>
            </Suspense>
            <ToastContainer />
        </ToastProvider>
    )
}
