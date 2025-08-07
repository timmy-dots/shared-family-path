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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout /> }>
            <Route index element={<Index />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/charter" element={<Charter />} />
            <Route path="/library" element={<Library />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/voting" element={<Voting />} />
            <Route path="/vault" element={<VaultPage />} />
            <Route path="/checkins" element={<Checkins />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
