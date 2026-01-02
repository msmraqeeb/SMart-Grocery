import React, { useMemo } from 'react';
import { Search, ShoppingCart, User, Phone, ChevronDown, LogOut, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
      <Link to={`/ products ? category = ${encodeURIComponent(category.name)} `} className="flex items-center justify-between w-full">
        <span>{category.name}</span>
        {hasChildren && <ChevronRight size={14} className={`opacity - 60 ${isHovered ? 'text-white' : ''} `} />}
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
  const { cart, isAdmin, user, signOut, searchQuery, setSearchQuery, openCart, storeInfo, categories, products, addToCart } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSticky, setIsSticky] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);

  const categoryTree = useMemo(() => {
    const tree = buildCategoryTree(categories);
    return tree;
  }, [categories]);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [products, searchQuery]);

  // Sync search query with URL and close menus
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowResults(false);

    // Parse search param from URL
    const params = new URLSearchParams(location.search);
    const urlSearch = params.get('search');

    // If there's a search param, verify it matches state (optional, but good for refresh)
    // If NO search param, clear the search query
    if (!urlSearch) {
      setSearchQuery('');
    } else {
      setSearchQuery(urlSearch);
    }
  }, [location.pathname, location.search]);

  // Handle sticky header on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/ products ? search = ${encodeURIComponent(searchQuery)} `);
      setShowResults(false);
    }
  };

  return (
    <header className="w-full flex flex-col font-sans z-50">
      {/* Main Header - Dark Green */}
      <div className="bg-[#00a651] py-3 md:py-4 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">

            {/* Top Row on Mobile: Hamburger | Logo | Cart */}
            <div className="flex items-center justify-between w-full md:w-auto md:justify-start gap-4">

              {/* Hamburger Menu Button (Mobile Only) */}
              <button
                className="md:hidden text-white p-1"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <LogOut size={24} className="rotate-180" /> : <ChevronDown size={28} className="rotate-[-90deg]" />}
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 cursor-auto">
                <div className="flex items-center">
                  {storeInfo.logo_url ? (
                    <img src={storeInfo.logo_url} alt={storeInfo.name} className="h-10 md:h-16 w-auto object-contain" />
                  ) : (
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 rounded-lg flex items-center justify-center">
                      <ShoppingCart size={20} className="text-white md:w-7 md:h-7" />
                    </div>
                  )}
                </div>
              </Link>

              {/* Mobile Cart Icon (Visible on small screens) */}
              <div className="flex md:hidden items-center gap-3 text-white">
                <button
                  onClick={openCart}
                  className="relative p-1"
                >
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-[#00a651]">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Search Bar - Full width on mobile, auto on desktop */}
            <div className="w-full md:w-auto md:flex-1 md:max-w-2xl order-last md:order-none mt-2 md:mt-0 relative z-50">
              <div className="flex w-full bg-white rounded-md overflow-hidden shadow-sm relative">
                <input
                  type="text"
                  placeholder="Type Your Products..."
                  className="w-full px-4 py-2.5 outline-none text-gray-600 text-sm"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)} // Delay to allow click
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="bg-[#ffa319] text-white px-4 md:px-6 font-semibold hover:bg-[#e69217] transition-all flex items-center gap-2 text-sm whitespace-nowrap"
                >
                  <Search size={18} />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>

              {/* Live Search Results Dropdown */}
              {showResults && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-b-lg mt-1 border border-gray-100 divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                  {searchResults.map(product => (
                    <div key={product.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors group cursor-pointer">
                      <Link to={`/ products ? search = ${encodeURIComponent(product.name)} `} className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setShowResults(false)}>
                        <img src={product.images[0]} className="w-12 h-12 object-cover rounded border border-gray-100" alt={product.name} />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-800 truncate group-hover:text-[#00a651] transition-colors">{product.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[#00a651] font-bold text-sm">৳{product.price}</span>
                            {product.originalPrice && <span className="text-gray-400 text-xs line-through">৳{product.originalPrice}</span>}
                          </div>
                        </div>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="bg-gray-100 text-gray-600 hover:bg-[#00a651] hover:text-white p-2 rounded-full transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95"
                        title="Add to Cart"
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  ))}
                  {searchResults.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm italic">No products found for "{searchQuery}"</div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-6 text-white">
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
      </div>

      {/* Navigation Sub-header (Desktop) */}
      <div className={`${isSticky ? 'h-[60px]' : 'h-0'} transition - all duration - 0 hidden md: block`}></div> {/* Placeholder to prevent jump */}
      <div className={`bg - white border - b border - gray - 100 hidden md:block transition - all duration - 300 ${isSticky ? 'fixed top-0 left-0 w-full z-[60] shadow-md py-2 animate-slideDown' : 'py-3'} `}>
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between gap-4">

          <div className="flex items-center gap-8">
            {/* Sticky Logo */}
            <div className={`transition - all duration - 300 overflow - hidden ${isSticky ? 'w-10 opacity-100 mr-2' : 'w-0 opacity-0'} `}>
              <Link to="/">
                {storeInfo.logo_url ? (
                  <img src={storeInfo.logo_url} alt={storeInfo.name} className="h-8 w-auto object-contain" />
                ) : (
                  <ShoppingCart size={24} className="text-[#00a651]" />
                )}
              </Link>
            </div>

            <div className="relative group text-left">
              <button className="flex items-center gap-2 bg-[#f0f9f4] text-[#00a651] px-4 py-1.5 rounded text-sm font-semibold border border-[#00a651]/10 hover:bg-[#e8f5ed] transition-colors peer">
                All Categories
                <ChevronDown size={16} />
              </button>
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
              <Link to="/" className={`${location.pathname === '/' ? 'text-[#00a651]' : 'hover:text-[#00a651]'} transition - colors`}>Home</Link>
              <Link to="/products" className={`${location.pathname === '/products' ? 'text-[#00a651]' : 'hover:text-[#00a651]'} transition - colors`}>Products</Link>
              <Link to="/my-account" className={`${location.pathname === '/my-account' ? 'text-[#00a651]' : 'hover:text-[#00a651]'} transition - colors`}>My Account</Link>
              <Link to="/blog" className={`${location.pathname.startsWith('/blog') ? 'text-[#00a651]' : 'hover:text-[#00a651]'} transition - colors`}>Blog</Link>
              {isAdmin && (
                <Link to="/admin" className={`${location.pathname.startsWith('/admin') ? 'text-[#00a651]' : 'hover:text-[#00a651]'} transition - colors font - bold`}>Dashboard</Link>
              )}
            </nav>
          </div>

          {/* Sticky Search */}
          <div className={`transition - all duration - 300 ease -in -out relative ${isSticky ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'} `}>
            <div className="flex w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200 relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-1.5 outline-none bg-transparent text-gray-600 text-xs"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
              />
              <button className="bg-[#00a651] text-white px-3 hover:bg-[#008c44] transition-colors">
                <Search size={14} />
              </button>
            </div>

            {/* Live Search Results Dropdown (Sticky) */}
            {showResults && searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-b-lg mt-1 border border-gray-100 divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                {searchResults.map(product => (
                  <div key={product.id + 'sticky'} className="flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors group cursor-pointer">
                    <Link to={`/ products ? search = ${product.name} `} className="flex items-center gap-2 flex-1 min-w-0" onClick={() => setShowResults(false)}>
                      <img src={product.images[0]} className="w-8 h-8 object-cover rounded border border-gray-100" alt={product.name} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-gray-800 truncate group-hover:text-[#00a651] transition-colors">{product.name}</h4>
                        <div className="flex items-center gap-1">
                          <span className="text-[#00a651] font-bold text-xs">৳{product.price}</span>
                          {product.originalPrice && <span className="text-gray-400 text-[10px] line-through">৳{product.originalPrice}</span>}
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="bg-gray-100 text-gray-600 hover:bg-[#00a651] hover:text-white p-1.5 rounded-full transition-all opacity-80 hover:opacity-100"
                      title="Add to Cart"
                    >
                      <ShoppingCart size={14} />
                    </button>
                  </div>
                ))}
                {searchResults.length === 0 && (
                  <div className="p-2 text-center text-gray-500 text-xs italic">No products found</div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Menu (Drawer) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 py-4 px-4 shadow-lg absolute w-full top-full left-0 z-40 max-h-[80vh] overflow-y-auto">
          <nav className="flex flex-col gap-4">
            {user ? (
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <Link to="/my-account" className="flex items-center gap-2 font-bold text-gray-700">
                  <User size={20} /> My Account
                </Link>
                <button onClick={signOut} className="text-red-500 text-xs font-bold border border-red-200 px-2 py-1 rounded">Sign Out</button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-[#00a651] text-white px-4 py-3 rounded-lg font-bold text-center justify-center">
                <User size={20} /> Login / Register
              </Link>
            )}

            <div className="h-px bg-gray-100 my-1"></div>

            <Link to="/" className="font-semibold text-gray-700 py-2">Home</Link>
            <Link to="/products" className="font-semibold text-gray-700 py-2">All Products</Link>

            <div className="py-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Categories</span>
              <div className="ml-2 flex flex-col gap-2">
                {categoryTree.map(cat => (
                  <Link key={cat.id} to={`/ products ? category = ${encodeURIComponent(cat.name)} `} className="text-gray-600 text-sm py-1 border-l-2 border-gray-200 pl-3">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/blog" className="font-semibold text-gray-700 py-2">Blog</Link>
            {isAdmin && <Link to="/admin" className="font-bold text-[#00a651] py-2">Admin Dashboard</Link>}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
