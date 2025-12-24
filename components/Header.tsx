
import React from 'react';
import { Search, ShoppingCart, User, Phone, ChevronDown, LogOut } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const { cart, isAdmin, user, signOut, searchQuery, setSearchQuery, openCart } = useStore();
  const location = useLocation();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="w-full flex flex-col font-sans sticky top-0 z-50">
      {/* Main Header - Dark Green */}
      <div className="bg-[#00a651] py-4 px-4 md:px-8">
        <div className="container mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link 
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-white cursor-pointer" 
          >
            <div className="flex items-center gap-1">
               <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart size={20} className="text-white" />
               </div>
               <span className="tracking-tight">SMart</span>
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
                <span className="font-bold text-sm">0123456789</span>
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
          <button className="flex items-center gap-2 bg-[#f0f9f4] text-[#00a651] px-4 py-1.5 rounded text-sm font-semibold border border-[#00a651]/10 hover:bg-[#e8f5ed] transition-colors">
            All Categories
            <ChevronDown size={16} />
          </button>
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
