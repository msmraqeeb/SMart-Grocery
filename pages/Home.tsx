import React, { useState, useEffect } from 'react';
import { ArrowRight, Truck, Headphones, ShieldCheck, Award } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';

const Home: React.FC = () => {
  const { products, categories, banners } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const sliderBanners = banners.filter(b => b.type === 'slider' && b.is_active);
  const rightTopBanner = banners.find(b => b.type === 'right_top' && b.is_active);
  const rightBottomBanner = banners.find(b => b.type === 'right_bottom' && b.is_active);

  useEffect(() => {
    if (sliderBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliderBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderBanners.length]);

  const hotSale = products.slice(0, 4);
  const popularItems = products.slice(0, 8);
  const foodItems = products.filter(p => p.category === 'Vegetables & Fruit' || p.category === 'Meats & Seafood').slice(0, 5);

  return (
    <div className="w-full bg-white pb-20">

      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Slider (Left 2/3) */}
          <div className="lg:col-span-2 relative rounded-xl overflow-hidden h-[350px] md:h-[450px]">
            {sliderBanners.length > 0 ? (
              <>
                {sliderBanners.map((banner, idx) => (
                  <div key={banner.id} className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                    <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
                    {(banner.title || banner.subtitle) && (
                      <div className="absolute top-1/2 -translate-y-1/2 left-12 max-w-md text-white drop-shadow-md p-4">
                        {banner.subtitle && <p className="text-[#00a651] bg-white/90 px-3 py-1 rounded w-fit font-bold uppercase tracking-wider mb-4 text-xs">{banner.subtitle}</p>}
                        {banner.title && <h2 className="text-4xl md:text-5xl font-black leading-tight mb-8 drop-shadow-lg">{banner.title}</h2>}
                        {banner.link && (
                          <a href={banner.link} className="inline-block bg-[#00a651] hover:bg-[#008c44] text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg hover:shadow-emerald-500/50 uppercase tracking-widest text-xs">
                            Shop Now ➝
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {sliderBanners.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {sliderBanners.map((_, idx) => (
                      <button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-[#00a651] w-8' : 'bg-white/50 w-2 hover:bg-white'}`} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex">
                <div className="w-1/2 bg-[#f0f9f4] relative">
                  <img src="https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-80" alt="delivery" />
                  <div className="absolute inset-0 bg-emerald-500/10"></div>
                </div>
                <div className="w-1/2 relative">
                  <img src="https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="farmer" />
                </div>
                <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-gray-400 hover:text-[#00a651] z-20">
                  <ArrowRight size={20} className="rotate-180" />
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-gray-400 hover:text-[#00a651] z-20">
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Right Banners (Right 1/3) */}
          <div className="flex flex-col gap-6 h-full">
            {/* Top Banner */}
            {rightTopBanner ? (
              <div className="flex-1 rounded-xl relative overflow-hidden flex flex-col justify-center group h-[215px]">
                <img src={rightTopBanner.image_url} alt={rightTopBanner.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="relative z-10 p-8 text-white">
                  {rightTopBanner.subtitle && <span className="font-bold text-xs mb-2 block uppercase tracking-wider text-emerald-300">{rightTopBanner.subtitle}</span>}
                  {rightTopBanner.title && <h3 className="text-2xl font-black mb-4 leading-tight">{rightTopBanner.title}</h3>}
                  {rightTopBanner.link && <a href={rightTopBanner.link} className="inline-flex items-center gap-2 text-sm font-bold hover:underline">Shop Now <ArrowRight size={14} /></a>}
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-[#f0f9f4] rounded-xl p-6 relative overflow-hidden flex flex-col justify-center border border-emerald-50">
                <div className="relative z-10">
                  <span className="text-[#00a651] font-bold text-xs mb-1 block uppercase tracking-wider">Only This Week</span>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">Quality eggs at an <br /> affordable price</h3>
                  <p className="text-gray-500 text-xs mb-4">Eat one every day</p>
                  <button className="bg-[#00a651] text-white text-xs px-5 py-2.5 rounded-full font-bold hover:bg-[#008c44] transition-colors flex items-center gap-2 group w-fit">
                    Shop Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <img src="https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=200" className="absolute -bottom-2 -right-4 w-40 h-40 object-contain mix-blend-multiply" alt="eggs" />
              </div>
            )}

            {/* Bottom Banner */}
            {rightBottomBanner ? (
              <div className="flex-1 rounded-xl relative overflow-hidden flex flex-col justify-center group h-[215px]">
                <img src={rightBottomBanner.image_url} alt={rightBottomBanner.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="relative z-10 p-8 text-white">
                  {rightBottomBanner.subtitle && <span className="font-bold text-xs mb-2 block uppercase tracking-wider text-emerald-300">{rightBottomBanner.subtitle}</span>}
                  {rightBottomBanner.title && <h3 className="text-2xl font-black mb-4 leading-tight">{rightBottomBanner.title}</h3>}
                  {rightBottomBanner.link && <a href={rightBottomBanner.link} className="inline-flex items-center gap-2 text-sm font-bold hover:underline">Shop Now <ArrowRight size={14} /></a>}
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-[#fff5f5] rounded-xl p-6 relative overflow-hidden flex flex-col justify-center border border-red-50">
                <div className="relative z-10">
                  <span className="text-[#00a651] font-bold text-xs mb-1 block uppercase tracking-wider">Fuel Your Day</span>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">Nutritious bites for <br /> mind and body.</h3>
                  <p className="text-gray-500 text-xs mb-4">Start fresh...</p>
                  <button className="bg-[#00a651] text-white text-xs px-5 py-2.5 rounded-full font-bold hover:bg-[#008c44] transition-colors flex items-center gap-2 group w-fit">
                    Shop Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=200" className="absolute -bottom-2 -right-4 w-40 h-40 object-contain mix-blend-multiply" alt="fruits" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-[#f7f8f3] py-8 mt-4 mb-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { icon: Headphones, title: 'Online Support' },
              { icon: ShieldCheck, title: 'Official Product' },
              { icon: Truck, title: 'Fastest Delivery' },
              { icon: Award, title: 'Secure Payment' },
              { icon: Award, title: 'Genuine Product' },
            ].map((feat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center gap-3">
                <div className="text-[#00a651]">
                  <feat.icon size={32} strokeWidth={1.5} />
                </div>
                <h4 className="font-bold text-[13px] text-emerald-900">{feat.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Sale */}
      <section className="container mx-auto px-4 md:px-8 mb-16">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-[#00a651] pl-4">Today's Hot Sale</h2>
          <a href="#" className="text-sm font-bold text-[#00a651] flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-tighter">View All Items <ArrowRight size={14} /></a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotSale.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Popular Items (Split Layout) */}
      <section className="container mx-auto px-4 md:px-8 mb-16">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-[#00a651] pl-4">Popular Items</h2>
          <a href="#" className="text-sm font-bold text-[#00a651] flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-tighter">View All Items <ArrowRight size={14} /></a>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Vertical Banner */}
          <div className="hidden lg:block bg-gradient-to-b from-[#00a651] to-[#008c44] rounded-xl p-8 relative overflow-hidden text-white h-full">
            <h3 className="text-3xl font-bold mb-4 font-serif italic">100% Fresh Vegetables and Authentic Products</h3>
            <p className="mb-8 text-emerald-100 opacity-90">Get the best quality products at the most affordable prices.</p>
            <button className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-bold hover:bg-yellow-300 transition-colors w-fit flex items-center gap-2">
              Shop Now ➝
            </button>
            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400" alt="fresh" className="absolute bottom-0 left-0 w-full h-1/2 object-cover opacity-30" />
          </div>
          {/* Grid */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularItems.slice(0, 6).map(product => (
              <ProductCard key={`pop-${product.id}`} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banners */}
      <section className="container mx-auto px-4 md:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#fdf0e6] p-6 rounded-xl flex items-center justify-between group cursor-pointer border border-orange-50">
            <div>
              <span className="text-[#00a651] text-xs font-bold mb-1 block uppercase">Ultimate Shopping</span>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Unbeatable Deals <br /> Just a Click Away!</h3>
              <button className="text-gray-600 text-xs font-bold border-b border-gray-600 hover:text-[#00a651] hover:border-[#00a651] transition-colors">Shop Now ➝</button>
            </div>
            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150" className="w-24 h-24 object-contain group-hover:scale-110 transition-transform mix-blend-multiply" alt="promo" />
          </div>
          <div className="bg-[#e6fbf2] p-6 rounded-xl flex items-center justify-between group cursor-pointer border border-emerald-50">
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-800 leading-tight">MEGA <br /> SAVINGS, <br /> ENDLESS <br /> SMILES!</h3>
            </div>
            <img src="https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=150" className="w-28 h-28 object-contain group-hover:scale-110 transition-transform mix-blend-multiply" alt="promo" />
          </div>
          <div className="bg-[#eef2ff] p-6 rounded-xl flex items-center justify-between group cursor-pointer border border-blue-50">
            <div>
              <span className="text-blue-500 text-xs font-bold mb-1 block uppercase">Everyday Shopping</span>
              <h3 className="font-bold text-lg text-gray-800 mb-2">With Us, Grocery <br /> Shopping is a Breeze</h3>
              <button className="text-gray-600 text-xs font-bold border-b border-gray-600 hover:text-[#00a651] hover:border-[#00a651] transition-colors">Shop Now ➝</button>
            </div>
            <img src="https://images.unsplash.com/photo-1543083507-073f4df8105d?auto=format&fit=crop&q=80&w=150" className="w-24 h-24 object-contain group-hover:scale-110 transition-transform mix-blend-multiply" alt="promo" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
