import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, Upload, Image, Package } from "lucide-react";
import type { Product } from "@shared/schema";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.enum(["jewelry", "shoes", "clothes", "furniture"], {
    required_error: "Please select a category",
  }),
  sku: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive").optional(),
  originalPrice: z.number().min(0, "Original price must be positive").optional(),
  stockQuantity: z.number().min(0, "Stock quantity must be positive").optional(),
  materials: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  imageUrl: z.string().min(1, "Product image is required"),
  overlayImageUrl: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AdminProductForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "jewelry",
      sku: "",
      description: "",
      price: undefined,
      originalPrice: undefined,
      stockQuantity: 0,
      materials: "",
      sizes: [],
      colors: [],
      tags: [],
      isActive: true,
      isFeatured: false,
      imageUrl: "",
      overlayImageUrl: "",
    },
  });

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem("authToken");
    if (!token) {
      setLocation("/admin/login");
      return;
    }

    // Check if this is edit mode
    if (params.id) {
      setIsEditMode(true);
      loadProduct(params.id);
    }
  }, [params.id, setLocation]);

  const loadProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load product");
      }

      const products = await response.json();
      const product = products.find((p: Product) => p.id === productId);
      
      if (!product) {
        throw new Error("Product not found");
      }

      setCurrentProduct(product);
      
      // Update form with product data
      form.reset({
        name: product.name,
        category: product.category as any,
        sku: product.sku || "",
        description: product.description || "",
        price: product.price ? product.price / 100 : undefined,
        originalPrice: product.originalPrice ? product.originalPrice / 100 : undefined,
        stockQuantity: product.stockQuantity || 0,
        materials: product.materials || "",
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        colors: Array.isArray(product.colors) ? product.colors : [],
        tags: Array.isArray(product.tags) ? product.tags : [],
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        imageUrl: product.imageUrl,
        overlayImageUrl: product.overlayImageUrl || "",
      });
    } catch (error) {
      console.error("Error loading product:", error);
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive",
      });
      setLocation("/admin/products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      // Convert prices to cents
      const submitData = {
        ...data,
        price: data.price ? Math.round(data.price * 100) : null,
        originalPrice: data.originalPrice ? Math.round(data.originalPrice * 100) : null,
      };

      const url = isEditMode ? `/api/admin/products/${params.id}` : "/api/admin/products";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save product");
      }

      toast({
        title: "Success",
        description: `Product ${isEditMode ? "updated" : "created"} successfully`,
      });

      setLocation("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (url: string) => {
    form.setValue("imageUrl", url);
  };

  const handleOverlayUpload = (url: string) => {
    form.setValue("overlayImageUrl", url);
  };

  const parseList = (value: string): string[] => {
    return value.split(",").map(item => item.trim()).filter(item => item.length > 0);
  };

  if (isLoading && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>Loading product...</p>
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
              <Link href="/admin/products">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Products
                </Button>
              </Link>
              <h1 className="text-xl font-bold">
                {isEditMode ? "Edit Product" : "Add New Product"}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential product details for your AR catalog
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Classic Gold Ring" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="RING-001" {...field} data-testid="input-sku" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="jewelry">Jewelry</SelectItem>
                          <SelectItem value="shoes">Shoes</SelectItem>
                          <SelectItem value="clothes">Clothes</SelectItem>
                          <SelectItem value="furniture">Furniture</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Elegant 18k gold ring with diamond setting..."
                          className="min-h-[100px]"
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
                <CardDescription>
                  Upload product and AR overlay images
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <ObjectUploader onUploadComplete={handleImageUpload}>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Product Image
                          </ObjectUploader>
                          {field.value && (
                            <div className="border rounded-lg p-4">
                              <img
                                src={field.value}
                                alt="Product preview"
                                className="h-32 w-32 object-cover rounded-md"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Main product image that customers will see in the catalog
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="overlayImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AR Overlay Image (Optional)</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <ObjectUploader onUploadComplete={handleOverlayUpload}>
                            <Image className="h-4 w-4 mr-2" />
                            Upload AR Overlay
                          </ObjectUploader>
                          {field.value && (
                            <div className="border rounded-lg p-4">
                              <img
                                src={field.value}
                                alt="AR overlay preview"
                                className="h-32 w-32 object-cover rounded-md"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Special AR version of the product for face overlay (transparent background recommended)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing and Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
                <CardDescription>
                  Set pricing and track inventory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="199.99"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            data-testid="input-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="299.99"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            data-testid="input-original-price"
                          />
                        </FormControl>
                        <FormDescription>For showing discounts</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stockQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                            data-testid="input-stock"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>
                  Optional product specifications and attributes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="materials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Materials</FormLabel>
                      <FormControl>
                        <Input placeholder="18k Gold, Diamond" {...field} data-testid="input-materials" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sizes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Sizes</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="S, M, L, XL"
                            value={field.value?.join(", ") || ""}
                            onChange={(e) => field.onChange(parseList(e.target.value))}
                            data-testid="input-sizes"
                          />
                        </FormControl>
                        <FormDescription>Comma-separated list</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="colors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Colors</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Gold, Silver, Rose Gold"
                            value={field.value?.join(", ") || ""}
                            onChange={(e) => field.onChange(parseList(e.target.value))}
                            data-testid="input-colors"
                          />
                        </FormControl>
                        <FormDescription>Comma-separated list</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="trending, bestseller, wedding"
                          value={field.value?.join(", ") || ""}
                          onChange={(e) => field.onChange(parseList(e.target.value))}
                          data-testid="input-tags"
                        />
                      </FormControl>
                      <FormDescription>Comma-separated list for filtering and search</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
                <CardDescription>
                  Control product visibility and features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-active"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Product will be visible in the AR catalog
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-featured"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured</FormLabel>
                        <FormDescription>
                          Highlight this product in featured sections
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <Link href="/admin/products">
                <Button variant="outline" disabled={isLoading} data-testid="button-cancel">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading} data-testid="button-save">
                {isLoading ? "Saving..." : isEditMode ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}