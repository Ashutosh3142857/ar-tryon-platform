import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { 
  Package, 
  Eye, 
  Camera, 
  Download, 
  Plus, 
  LogOut, 
  Building2,
  Settings,
  BarChart3
} from "lucide-react";
import type { Product, Tenant, AdminUser } from "@shared/schema";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check auth and load user data
    const token = localStorage.getItem("authToken");
    const storedTenant = localStorage.getItem("tenant");
    const storedUser = localStorage.getItem("adminUser");

    if (!token || !storedTenant || !storedUser) {
      setLocation("/admin/login");
      return;
    }

    setTenant(JSON.parse(storedTenant));
    setAdminUser(JSON.parse(storedUser));
    loadProducts();
  }, [setLocation]);

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/admin/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("tenant");
    localStorage.removeItem("adminUser");
    setLocation("/admin/login");
  };

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.isActive).length,
    featuredProducts: products.filter(p => p.isFeatured).length,
    categories: new Set(products.map(p => p.category)).size,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">{tenant?.name}</h1>
                  <p className="text-sm text-muted-foreground">Admin Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {adminUser?.firstName}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-products">
                {stats.totalProducts}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-active-products">
                {stats.activeProducts}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-featured-products">
                {stats.featuredProducts}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-categories">
                {stats.categories}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to manage your AR try-on experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/admin/products/new">
                <Button className="w-full justify-start" data-testid="button-add-product">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>
              </Link>
              
              <Link href="/admin/products">
                <Button variant="outline" className="w-full justify-start" data-testid="button-manage-products">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Products
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open(`/ar/${tenant?.slug}`, '_blank')}
                data-testid="button-preview-ar"
              >
                <Camera className="h-4 w-4 mr-2" />
                Preview AR Experience
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your AR Try-On Link</CardTitle>
              <CardDescription>
                Share this link with your customers to access your AR experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono">
                    {window.location.origin}/ar/{tenant?.slug}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/ar/${tenant?.slug}`);
                      toast({
                        title: "Copied!",
                        description: "AR link copied to clipboard",
                      });
                    }}
                    data-testid="button-copy-link"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Products</CardTitle>
              <CardDescription>
                Your latest product uploads
              </CardDescription>
            </div>
            <Link href="/admin/products">
              <Button variant="outline" size="sm" data-testid="button-view-all">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by adding your first product to enable AR try-on
                </p>
                <Link href="/admin/products/new">
                  <Button data-testid="button-add-first-product">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.slice(0, 6).map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    data-testid={`product-card-${product.id}`}
                  >
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                    )}
                    <h4 className="font-semibold text-sm mb-2">{product.name}</h4>
                    <div className="flex items-center justify-between">
                      <Badge variant={product.category === 'jewelry' ? 'default' : 'secondary'}>
                        {product.category}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {product.isFeatured && (
                          <Badge variant="outline" className="text-xs">Featured</Badge>
                        )}
                        {product.isActive && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}