import { Product, ProductCategory } from '@/types/ar-types';

export const productsByCategory: Record<ProductCategory, Product[]> = {
  jewelry: [
    {
      id: 'jewelry-1',
      name: 'Diamond Necklace',
      category: 'jewelry',
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
      price: 29999,
      description: 'Elegant diamond necklace'
    },
    {
      id: 'jewelry-2',
      name: 'Golden Bracelet',
      category: 'jewelry',
      imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
      price: 15999,
      description: 'Golden bracelet with intricate design'
    },
    {
      id: 'jewelry-3',
      name: 'Pearl Earrings',
      category: 'jewelry',
      imageUrl: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
      price: 8999,
      description: 'Vintage pearl earrings'
    },
    {
      id: 'jewelry-4',
      name: 'Silver Watch',
      category: 'jewelry',
      imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
      price: 19999,
      description: 'Silver watch with leather strap'
    },
    {
      id: 'jewelry-5',
      name: 'Rose Gold Ring',
      category: 'jewelry',
      imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
      price: 12999,
      description: 'Rose gold ring with gemstone'
    },
    {
      id: 'jewelry-6',
      name: 'Chain Necklace',
      category: 'jewelry',
      imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
      price: 7999,
      description: 'Modern chain necklace'
    },
    {
      id: 'jewelry-7',
      name: 'Sapphire Earrings',
      category: 'jewelry',
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
      price: 22999,
      description: 'Sapphire stud earrings'
    },
    {
      id: 'jewelry-8',
      name: 'Tennis Bracelet',
      category: 'jewelry',
      imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200',
      price: 35999,
      description: 'Tennis bracelet with diamonds'
    }
  ],
  shoes: [
    {
      id: 'shoes-1',
      name: 'White Sneakers',
      category: 'shoes',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      price: 12999,
      description: 'White leather sneakers'
    },
    {
      id: 'shoes-2',
      name: 'Black Dress Shoes',
      category: 'shoes',
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      price: 18999,
      description: 'Black dress shoes'
    },
    {
      id: 'shoes-3',
      name: 'Red High Heels',
      category: 'shoes',
      imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      price: 15999,
      description: 'Red high heels'
    },
    {
      id: 'shoes-4',
      name: 'Brown Leather Boots',
      category: 'shoes',
      imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      price: 22999,
      description: 'Brown leather boots'
    },
    {
      id: 'shoes-5',
      name: 'Canvas Casual Shoes',
      category: 'shoes',
      imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      price: 8999,
      description: 'Canvas casual shoes'
    },
    {
      id: 'shoes-6',
      name: 'Running Shoes',
      category: 'shoes',
      imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      price: 14999,
      description: 'Running shoes with colorful design'
    }
  ],
  clothes: [
    {
      id: 'clothes-1',
      name: 'Denim Jacket',
      category: 'clothes',
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500',
      price: 7999,
      description: 'Blue denim jacket'
    },
    {
      id: 'clothes-2',
      name: 'White T-Shirt',
      category: 'clothes',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500',
      price: 2999,
      description: 'White cotton t-shirt'
    },
    {
      id: 'clothes-3',
      name: 'Leather Jacket',
      category: 'clothes',
      imageUrl: 'https://images.unsplash.com/photo-1520975661595-6453be3f7070?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1520975661595-6453be3f7070?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500',
      price: 19999,
      description: 'Black leather jacket'
    },
    {
      id: 'clothes-4',
      name: 'Summer Dress',
      category: 'clothes',
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500',
      price: 8999,
      description: 'Red summer dress'
    },
    {
      id: 'clothes-5',
      name: 'Navy Hoodie',
      category: 'clothes',
      imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500',
      price: 5999,
      description: 'Navy blue hoodie'
    },
    {
      id: 'clothes-6',
      name: 'Striped Shirt',
      category: 'clothes',
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500',
      price: 4999,
      description: 'Striped button-up shirt'
    }
  ],
  furniture: [
    {
      id: 'furniture-1',
      name: 'Modern Gray Sofa',
      category: 'furniture',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
      price: 89999,
      description: 'Modern gray sofa'
    },
    {
      id: 'furniture-2',
      name: 'Coffee Table',
      category: 'furniture',
      imageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
      price: 29999,
      description: 'Wooden coffee table'
    },
    {
      id: 'furniture-3',
      name: 'Desk Chair',
      category: 'furniture',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
      price: 39999,
      description: 'Modern desk chair'
    },
    {
      id: 'furniture-4',
      name: 'Minimalist Bookshelf',
      category: 'furniture',
      imageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      overlayImageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
      price: 19999,
      description: 'Minimalist bookshelf'
    }
  ]
};

export const getAllProducts = (): Product[] => {
  return Object.values(productsByCategory).flat();
};

export const getProductsByCategory = (category: ProductCategory): Product[] => {
  return productsByCategory[category] || [];
};

export const getProductById = (id: string): Product | undefined => {
  return getAllProducts().find(product => product.id === id);
};
