import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import ARTryOnPage from "@/pages/ar-try-on";
import AdminLogin from "@/pages/admin-login";
import AdminRegister from "@/pages/admin-register";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminProducts from "@/pages/admin-products";
import AdminProductForm from "@/pages/admin-product-form";

function Router() {
  return (
    <Switch>
      {/* AR Try-On Routes */}
      <Route path="/" component={ARTryOnPage} />
      <Route path="/ar-try-on" component={ARTryOnPage} />
      <Route path="/ar/:tenantSlug" component={ARTryOnPage} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/register" component={AdminRegister} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/products/new" component={AdminProductForm} />
      <Route path="/admin/products/:id/edit" component={AdminProductForm} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
