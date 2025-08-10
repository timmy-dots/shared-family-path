import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Charter from "./pages/Charter";
import Library from "./pages/Library";
import Meetings from "./pages/Meetings";
import Voting from "./pages/Voting";
import VaultPage from "./pages/VaultPage";
import Checkins from "./pages/Checkins";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import ConflictResolution from "./pages/ConflictResolution";
import FamilyChannel from "./pages/FamilyChannel";
import AcceptInvite from "./pages/AcceptInvite";
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
              <Route path="/charter" element={<Charter />} />
              <Route path="/library" element={<Library />} />
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/voting" element={<Voting />} />
              <Route path="/vault" element={<VaultPage />} />
              <Route path="/family-channel" element={<FamilyChannel />} />
              <Route path="/accept-invite" element={<AcceptInvite />} />
              <Route path="/checkins" element={<Checkins />} />
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
