
import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useStore } from '../context/StoreContext';

const Footer: React.FC = () => {
  const { storeInfo } = useStore();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] text-gray-300 pt-16 pb-8 text-sm">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

          {/* Company Info */}
          <div className="space-y-4">
            <div className="mb-6">
              {storeInfo.logo_url ? (
                <img src={storeInfo.logo_url} alt={storeInfo.name} className="h-16 w-auto object-contain" />
              ) : (
                <div className="text-emerald-500 mb-4">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.2 7.8l-7.7 7.7a2 2 0 0 1-2.8 0L2 7.8" />
                    <path d="M2 12l7.7 7.7a2 2 0 0 0 2.8 0l7.7-7.7" />
                  </svg>
                </div>
              )}
            </div>
            <p className="leading-relaxed">{storeInfo.name} - Your one door-step solution for groceries and daily needs. Freshness guaranteed.</p>
            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-emerald-500 shrink-0" size={18} />
                <span>{storeInfo.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-emerald-500 shrink-0" size={18} />
                <span>{storeInfo.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-emerald-500 shrink-0" size={18} />
                <span>{storeInfo.email}</span>
              </div>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about-us" className="hover:text-emerald-500 transition-colors">About Us</Link></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Delivery Information</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Category</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Dairy & Bakery</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Fruits & Vegetables</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Snack & Spice</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Juice & Drinks</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Social Links</h3>
            <div className="flex gap-4 mb-6">
              {storeInfo.socials?.facebook && <a href={storeInfo.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-500 transition-colors cursor-pointer"><Facebook size={18} /></a>}
              {storeInfo.socials?.instagram && <a href={storeInfo.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-500 transition-colors cursor-pointer"><Instagram size={18} /></a>}
              {(!storeInfo.socials?.facebook && !storeInfo.socials?.instagram) && <span className="text-gray-500 text-sm">No social links configured.</span>}
            </div>
            <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700 cursor-pointer hover:border-emerald-500 transition-all">
              <Smartphone size={24} className="text-white" />
              <div className="flex flex-col">
                <span className="text-[10px] leading-tight text-gray-400">Download on</span>
                <span className="text-xs font-bold text-white">App Store</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
            <p>© {currentYear} {storeInfo.name}. All rights reserved.</p>
            <p className="text-gray-500 hidden md:block">|</p>
            <p>Developed by: <a href="https://shakilmahmud.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors">Shakil Mahmud</a></p>
          </div>
          <div className="flex gap-2">
            {['visa', 'mastercard', 'paypal'].map(p => (
              <div key={p} className="h-6 w-10 bg-white/10 rounded flex items-center justify-center text-[8px] font-black text-white/50 uppercase tracking-tighter">
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer >
  );
};

export default Footer;
