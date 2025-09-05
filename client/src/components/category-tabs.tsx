import { ProductCategory } from '@/types/ar-types';
import { Button } from '@/components/ui/button';
import { Gem, Footprints, Shirt, Sofa } from 'lucide-react';

interface CategoryTabsProps {
  activeCategory: ProductCategory;
  onCategoryChange: (category: ProductCategory) => void;
}

const categoryConfig = {
  jewelry: { icon: Gem, label: 'Jewelry' },
  shoes: { icon: Footprints, label: 'Shoes' },
  clothes: { icon: Shirt, label: 'Clothes' },
  furniture: { icon: Sofa, label: 'Furniture' }
};

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="ar-overlay rounded-2xl p-1" data-testid="category-tabs">
      <div className="flex space-x-1">
        {Object.entries(categoryConfig).map(([category, config]) => {
          const Icon = config.icon;
          const isActive = activeCategory === category;
          
          return (
            <Button
              key={category}
              className={`
                flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
              onClick={() => onCategoryChange(category as ProductCategory)}
              data-testid={`tab-${category}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {config.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
