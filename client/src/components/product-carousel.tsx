import { Product, ProductCategory } from '@/types/ar-types';
import { getProductsByCategory } from '@/data/products';
import { Button } from '@/components/ui/button';

interface ProductCarouselProps {
  activeCategory: ProductCategory;
  selectedProduct: Product | null;
  onProductSelect: (product: Product) => void;
}

export function ProductCarousel({ 
  activeCategory, 
  selectedProduct, 
  onProductSelect 
}: ProductCarouselProps) {
  const products = getProductsByCategory(activeCategory);

  return (
    <div className="px-4" data-testid="product-carousel">
      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
        {products.map((product) => {
          const isSelected = selectedProduct?.id === product.id;
          
          return (
            <Button
              key={product.id}
              className={`
                product-item flex-shrink-0 w-16 h-16 p-2 cursor-pointer
                rounded-xl transition-all hover:scale-105 hover:shadow-lg
                ${isSelected 
                  ? 'ring-2 ring-primary bg-card' 
                  : 'bg-card hover:bg-card/80'
                }
              `}
              onClick={() => onProductSelect(product)}
              data-testid={`product-${product.id}`}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
                draggable={false}
              />
            </Button>
          );
        })}
      </div>
      
      {selectedProduct && (
        <div className="mt-3 text-center">
          <p className="text-white text-sm font-medium" data-testid="text-selected-product">
            {selectedProduct.name}
          </p>
          {selectedProduct.price && (
            <p className="text-white/70 text-xs" data-testid="text-product-price">
              ${(selectedProduct.price / 100).toFixed(2)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
