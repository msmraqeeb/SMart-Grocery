
import React, { useMemo } from 'react';
import { Search, ShoppingCart, User, Phone, ChevronDown, LogOut, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Link, useLocation } from 'react-router-dom';
import { Category } from '../types';

interface CategoryNode extends Category {
  children: CategoryNode[];
  level: number;
}

const buildCategoryTree = (categories: Category[], parentId: string | null = null, level: number = 0): CategoryNode[] => {
  return categories
    .filter(cat => cat.parentId == parentId)
    .map(cat => ({
      ...cat,
      children: buildCategoryTree(categories, cat.id, level + 1),
      level
    }));
};

const CategoryMenuItem: React.FC<{ category: CategoryNode }> = ({ category }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const hasChildren = category.children.length > 0;

  return (
    <div
      className="relative px-4 py-2 hover:bg-[#ffa319] hover:text-white transition-colors cursor-pointer text-gray-700 text-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products?category=${encodeURIComponent(category.name)}`} className="flex items-center justify-between w-full">
        <span>{category.name}</span>
        {hasChildren && <ChevronRight size={14} className={`opacity-60 ${isHovered ? 'text-white' : ''}`} />}
      </Link>

      {/* Flyout Submenu */}
      {hasChildren && isHovered && (
        <div className="absolute left-full top-0 w-64 bg-white border border-gray-100 shadow-xl py-2 z-50 -ml-0.5 rounded-r-xl rounded-b-xl min-h-full">
          {category.children.map(child => (
            <CategoryMenuItem key={child.id} category={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const Header: React.FC = () => {
  const { cart, isAdmin, user, signOut, searchQuery, setSearchQuery, openCart, storeInfo, categories } = useStore();
  const location = useLocation();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const categoryTree = useMemo(() => {
    const tree = buildCategoryTree(categories);
    console.log('DEBUG: All Categories:', categories);
    console.log('DEBUG: Built Tree:', tree);
    return tree;
  }, [categories]);

  return (
    <header className="w-full flex flex-col font-sans sticky top-0 z-50">
      {/* Main Header - Dark Green */}
      <div className="bg-[#00a651] py-4 px-4 md:px-8">
        <div className="container mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="flex items-center">
              {storeInfo.logo_url ? (
                <img src={storeInfo.logo_url} alt={storeInfo.name} className="h-16 w-auto object-contain" />
              ) : (
                <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart size={28} className="text-white" />
                </div>
              )}
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <div className="flex w-full bg-white rounded-md overflow-hidden shadow-sm">
              <input
                type="text"
                placeholder="Type Your Products..."
                className="w-full px-4 py-2.5 outline-none text-gray-600 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="bg-[#ffa319] text-white px-6 font-semibold hover:bg-[#e69217] transition-colors flex items-center gap-2 text-sm">
                <Search size={18} />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 text-white">
            <div className="hidden lg:flex items-center gap-3">
              <Phone size={28} />
              <div className="flex flex-col">
                <span className="text-[10px] opacity-90 leading-tight">Order inquiry</span>
                <span className="font-bold text-sm">{storeInfo.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={openCart}
                className="relative p-2 hover:bg-white/10 rounded-full transition-colors group"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-[#00a651]">
                    {cartCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link to="/my-account" className="p-2 hover:bg-white/10 rounded-full transition-colors" title="My Account">
                    <User size={24} />
                  </Link>
                  <button onClick={signOut} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Sign Out">
                    <LogOut size={24} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg font-bold text-sm hover:bg-white/30 transition-colors">
                  <User size={18} />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-header */}
      <div className="bg-white border-b border-gray-100 py-3 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 flex items-center gap-8">
          <div className="relative group text-left">
            <button className="flex items-center gap-2 bg-[#f0f9f4] text-[#00a651] px-4 py-1.5 rounded text-sm font-semibold border border-[#00a651]/10 hover:bg-[#e8f5ed] transition-colors peer">
              All Categories
              <ChevronDown size={16} />
            </button>

            {/* Main Dropdown */}
            <div className="absolute top-full left-0 w-64 bg-white border border-gray-100 rounded-xl shadow-xl py-2 opacity-0 invisible peer-hover:opacity-100 peer-hover:visible hover:opacity-100 hover:visible transition-all z-50">
              <Link to="/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#ffa319] hover:text-white font-medium transition-colors">
                All Products
              </Link>

              {categoryTree.map(cat => (
                <CategoryMenuItem key={cat.id} category={cat} />
              ))}
            </div>
          </div>

          <nav className="flex gap-6 text-sm font-medium text-gray-600">
            <Link
              to="/"
              className={`${location.pathname === '/' ? 'text-[#00a651]' : 'hover:text-[#00a651]'} transition-colors`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`${location.pathname === '/products' ? 'text-[#00a651]' : 'hover:text-[#00a651]'} transition-colors`}
            >
              Products
            </Link>
            <Link
              to="/my-account"
              className={`${location.pathname === '/my-account' ? 'text-[#00a651]' : 'hover:text-[#00a651]'} transition-colors`}
            >
              My Account
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`${location.pathname.startsWith('/admin') ? 'text-[#00a651]' : 'hover:text-[#00a651]'} transition-colors font-bold`}
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
