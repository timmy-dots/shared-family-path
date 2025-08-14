import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Calculators from './pages/Calculators';
import Library from "./pages/Library";
import Meetings from "./pages/Meetings";
import Voting from "./pages/Voting";
import VaultPage from "./pages/VaultPage";
import Appointments from "./pages/Appointments";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import ConflictResolution from "./pages/ConflictResolution";
import FamilyChannel from "./pages/FamilyChannel";
import AcceptInvite from "./pages/AcceptInvite";
import DiscoverValues from "./pages/DiscoverValues";
import ValuesComparison from "./pages/ValuesComparison";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<Layout /> }>
              <Route index element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Account />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/calculators" element={<Calculators />} />
              <Route path="/library" element={<Library />} />
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/voting" element={<Voting />} />
              <Route path="/vault" element={<VaultPage />} />
              <Route path="/family-channel" element={<FamilyChannel />} />
              <Route path="/accept-invite" element={<AcceptInvite />} />
              <Route path="/discover-values" element={<DiscoverValues />} />
              <Route path="/values-comparison" element={<ValuesComparison />} />
              <Route path="/Appointments" element={<Appointments />} />
              <Route path="/conflict" element={<ConflictResolution />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
