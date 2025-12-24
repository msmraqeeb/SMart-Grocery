
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, ChevronRight, Search, RotateCcw, Check, Star } from 'lucide-react';
import { Category } from '../types';

const Products: React.FC = () => {
  const { products, categories, searchQuery, brands, reviews } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMinRating, setSelectedMinRating] = useState<number | null>(null);
  
  const hierarchicalCategories = useMemo(() => {
    const buildHierarchy = (parentId: string | null = null, level: number = 0): (Category & { level: number })[] => {
      let result: (Category & { level: number })[] = [];
      const children = categories.filter(c => c.parentId === parentId);
      children.forEach(child => {
        result.push({ ...child, level });
        const subChildren = buildHierarchy(child.id, level + 1);
        result = [...result, ...subChildren];
      });
      return result;
    };
    return buildHierarchy(null);
  }, [categories]);

  // Helper to find all descendant category names for a given parent name
  const selectedCategoryFamily = useMemo(() => {
    if (selectedCategory === 'All') return [];

    const getDescendantNames = (catName: string): string[] => {
      const currentCat = categories.find(c => c.name === catName);
      if (!currentCat) return [catName];

      let names = [catName];
      const directChildren = categories.filter(c => c.parentId === currentCat.id);
      
      directChildren.forEach(child => {
        names = [...names, ...getDescendantNames(child.name)];
      });
      
      return names;
    };

    return getDescendantNames(selectedCategory);
  }, [selectedCategory, categories]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const searchMatch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Updated category match: include product if its category is the selected one OR any of its descendants
      const categoryMatch = selectedCategory === 'All' || selectedCategoryFamily.includes(p.category);
      
      const brandMatch = selectedBrands.length === 0 || (p.brand && selectedBrands.includes(p.brand));
      
      let ratingMatch = true;
      if (selectedMinRating !== null) {
        const prodReviews = reviews.filter(r => r.productId === p.id);
        const avg = prodReviews.length > 0 ? prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length : 0;
        ratingMatch = avg >= selectedMinRating;
      }

      return searchMatch && categoryMatch && brandMatch && ratingMatch;
    });
  }, [products, searchQuery, selectedCategory, selectedCategoryFamily, selectedBrands, selectedMinRating, reviews]);

  const toggleBrand = (brandName: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandName) ? prev.filter(b => b !== brandName) : [...prev, brandName]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedBrands([]);
    setSelectedMinRating(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="lg:w-72 space-y-8 shrink-0">
            {/* Category Filter */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <Filter size={18} className="text-emerald-500" />
                 Categories
               </h3>
               <div className="space-y-1">
                 <button 
                   onClick={() => setSelectedCategory('All')}
                   className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'All' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-50'}`}
                 >
                   All Categories
                 </button>
                 {hierarchicalCategories.map(cat => (
                   <button 
                     key={cat.id}
                     onClick={() => setSelectedCategory(cat.name)}
                     className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${selectedCategory === cat.name ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-50'}`}
                     style={{ paddingLeft: `${(cat.level * 16) + 12}px` }}
                   >
                     {cat.level > 0 && <ChevronRight size={12} className="opacity-30" />}
                     {cat.name}
                   </button>
                 ))}
               </div>
            </div>

            {/* Brand Filter */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <SlidersHorizontal size={18} className="text-emerald-500" />
                 Brands
               </h3>
               <div className="space-y-2">
                 {brands.length === 0 ? (
                   <p className="text-xs text-gray-400 italic">No brands found</p>
                 ) : (
                   brands.map(brand => (
                    <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={selectedBrands.includes(brand.name)} 
                          onChange={() => toggleBrand(brand.name)}
                          className="peer h-5 w-5 appearance-none rounded border-2 border-gray-200 checked:bg-emerald-500 checked:border-emerald-500 transition-all"
                        />
                        <Check size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 group-hover:text-emerald-500 transition-colors">{brand.name}</span>
                    </label>
                   ))
                 )}
               </div>
            </div>

            {/* Rating Filter */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-gray-800 mb-4">Customer Rating</h3>
               <div className="space-y-2">
                 {[4, 3, 2, 1].map(stars => (
                   <button 
                     key={stars}
                     onClick={() => setSelectedMinRating(stars)}
                     className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${selectedMinRating === stars ? 'bg-amber-50 text-amber-700' : 'hover:bg-gray-50 text-gray-600'}`}
                   >
                     <div className="flex text-amber-400">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} size={14} fill={i < stars ? "currentColor" : "none"} className={i < stars ? "" : "text-gray-200"} />
                       ))}
                     </div>
                     <span className="font-medium">& Up</span>
                   </button>
                 ))}
               </div>
            </div>

            {/* Reset Action */}
            <button 
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold text-gray-400 hover:text-emerald-500 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all"
            >
              <RotateCcw size={16} />
              Reset All Filters
            </button>
          </aside>

          {/* Product Listing Main Area */}
          <main className="flex-1 space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm font-medium text-gray-500">
                Showing <span className="font-bold text-gray-800">{filteredProducts.length}</span> results 
                {selectedCategory !== 'All' && <span> in <span className="text-emerald-500 font-bold">{selectedCategory}</span></span>}
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 font-medium">Sort by:</span>
                  <select className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 font-bold text-gray-700 outline-none focus:border-emerald-500">
                    <option>Default Sorting</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Average Rating</option>
                    <option>Newest First</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-center border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Search size={32} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 max-w-xs">We couldn't find any products matching your current filters. Try adjusting your selection!</p>
                <button onClick={resetFilters} className="mt-8 bg-emerald-500 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-600 transition-all">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
