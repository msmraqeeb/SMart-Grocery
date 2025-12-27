import React from 'react';
import { Link } from 'react-router-dom';
import {
    Heart, ShieldCheck, Zap, User, Star, Truck,
    Leaf, Award, Clock, MapPin, Phone, CreditCard,
    Gift, Smile, Sun, Droplets, ShoppingBasket, Tag,
    Globe, Anchor, Coffee, Package, Layers, Info, CheckCircle
} from 'lucide-react';

// --- Icon Mapping ---
const ICONS: Record<string, any> = {
    Heart, ShieldCheck, Zap, User, Star, Truck,
    Leaf, Award, Clock, MapPin, Phone, CreditCard,
    Gift, Smile, Sun, Droplets, ShoppingBasket, Tag,
    Globe, Anchor, Coffee, Package, Layers, Info, CheckCircle
};

export const StorySection: React.FC<{ data: any }> = ({ data }) => {
    return (
        <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2 space-y-6">
                {data.badge && (
                    <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest inline-block">
                        {data.badge}
                    </span>
                )}
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                    {data.title}
                    {data.title2 && <span className="block text-[#10B981] mt-1">{data.title2}</span>}
                </h2>
                <div className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                    {data.description}
                </div>
            </div>
            <div className="lg:w-1/2 relative group">
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-100 transform transition-transform group-hover:scale-[1.01] duration-500">
                    <img
                        src={data.image_url}
                        alt={data.title}
                        className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
            </div>
        </div>
    );
};

export const ValuesGrid: React.FC<{ data: any }> = ({ data }) => {
    return (
        <div>
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <h2 className="text-3xl font-black text-gray-900">{data.title}</h2>
                <p className="text-gray-500 font-medium">{data.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.items?.map((item: any, idx: number) => {
                    const Icon = ICONS[item.icon] || Star;
                    return (
                        <div key={idx} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 group-hover:bg-[#10B981] group-hover:text-white transition-all duration-300">
                                <Icon size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                {item.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const HeroSection: React.FC<{ data: any }> = ({ data }) => {
    return (
        <div className="relative overflow-hidden h-[400px] md:h-[500px] flex items-center justify-center text-center">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={data.background_url}
                    alt="Hero Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-6">
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
                    {data.title}
                </h1>
                <p className="text-lg md:text-2xl text-gray-200 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                    {data.description}
                </p>
            </div>
        </div>
    );
};

export const CtaSection: React.FC<{ data: any }> = ({ data }) => {
    return (
        <div className="bg-[#003d29] rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden group">
            {/* Decorative Overlay */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight whitespace-pre-line tracking-tight">
                    {data.title}
                </h2>
                <p className="text-emerald-100/80 text-lg font-medium max-w-xl mx-auto">
                    {data.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    {data.button1_text && (
                        <Link to={data.button1_link || '#'} className="bg-[#10B981] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all hover:scale-105 shadow-lg shadow-emerald-900/20 active:scale-95 w-full sm:w-auto">
                            {data.button1_text}
                        </Link>
                    )}
                    {data.button2_text && (
                        <Link to={data.button2_link || '#'} className="border-2 border-emerald-800/50 text-emerald-100 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-900/30 hover:text-white hover:border-emerald-500/50 transition-all active:scale-95 w-full sm:w-auto">
                            {data.button2_text}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};
