
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, MessageCircle, PhoneCall, Star, Plus, Minus, ChevronRight, X, Info, Send, ChevronLeft } from 'lucide-react';
import { Variant, Review } from '../types';

const ProductDetails: React.FC = () => {
  const { slug } = useParams() as { slug: string };
  const { products, addToCart, reviews, addReview, userProfile } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedAttrValues, setSelectedAttrValues] = useState<Record<string, string>>({});
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  
  // Review state
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const product = products.find(p => p.slug === slug);
  const productReviews = useMemo(() => reviews.filter(r => r.productId === product?.id), [reviews, product]);

  const ratingStats = useMemo(() => {
    if (productReviews.length === 0) return { average: 0, total: 0, recommendedPercent: 0, starCounts: [0,0,0,0,0] };
    const total = productReviews.length;
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    const average = (sum / total).toFixed(1);
    const recommended = productReviews.filter(r => r.rating >= 4).length;
    const recommendedPercent = Math.round((recommended / total) * 100);
    
    const counts = [0, 0, 0, 0, 0];
    productReviews.forEach(r => counts[r.rating - 1]++);
    
    return { average, total, recommendedPercent, starCounts: counts.reverse() };
  }, [productReviews]);

  // Group attributes for dynamic selection
  const attributeList = useMemo(() => {
    if (!product?.variants) return [];
    const attrs: Record<string, Set<string>> = {};
    product.variants.forEach(v => {
      Object.entries(v.attributeValues as Record<string, string>).forEach(([name, val]) => {
        if (!attrs[name]) attrs[name] = new Set<string>();
        attrs[name].add(val);
      });
    });
    return Object.entries(attrs).map(([name, values]) => ({ name, values: Array.from(values) }));
  }, [product]);

  const currentVariant = useMemo(() => {
    if (!product?.variants || Object.keys(selectedAttrValues).length === 0) return null;
    return product.variants.find(v => 
      Object.entries(selectedAttrValues).every(([name, val]) => v.attributeValues[name] === val)
    ) || null;
  }, [selectedAttrValues, product]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product?.variants?.length === 1) {
      setSelectedAttrValues(product.variants[0].attributeValues);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
        <Link to="/" className="text-emerald-500 font-bold hover:underline mt-4 inline-block">Return Home</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0 && !currentVariant) {
      setSelectionError("Please select a variant first.");
      return;
    }
    setSelectionError(null);
    addToCart(product, currentVariant || undefined, quantity);
  };

  const handleAttrSelect = (name: string, value: string) => {
    setSelectedAttrValues(prev => ({ ...prev, [name]: value }));
    setSelectionError(null);
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      alert("Please select a star rating.");
      return;
    }
    if (!reviewComment.trim()) {
      alert("Please write a comment.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await addReview({
        productId: product.id,
        productName: product.name,
        authorName: userProfile?.full_name || userProfile?.email?.split('@')[0] || 'Guest User',
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewComment('');
      setReviewRating(0);
      alert("Review submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Pricing display standardized
  // When a variant is selected, use its specific price and originalPrice
  const displayPrice = currentVariant ? currentVariant.price : product.price;
  const displayOriginalPrice = currentVariant ? currentVariant.originalPrice : product.originalPrice;
  
  const displayImages = product.images || [];
  const variantImage = currentVariant?.image;

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Gallery Section */}
          <div className="lg:w-1/2 space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm aspect-square flex items-center justify-center p-8 relative group">
              <img 
                src={variantImage || displayImages[activeImageIdx] || ''} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain transition-all duration-500" 
              />
              {displayImages.length > 1 && !variantImage && (
                <>
                   <button onClick={() => setActiveImageIdx(prev => (prev === 0 ? displayImages.length - 1 : prev - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-emerald-500">
                     <ChevronLeft size={24} />
                   </button>
                   <button onClick={() => setActiveImageIdx(prev => (prev === displayImages.length - 1 ? 0 : prev + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-emerald-500">
                     <ChevronRight size={24} />
                   </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {!variantImage && displayImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {displayImages.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-20 h-20 rounded-xl border-2 shrink-0 p-2 bg-white transition-all ${activeImageIdx === idx ? 'border-emerald-500 shadow-md' : 'border-gray-100 hover:border-emerald-200'}`}
                  >
                    <img src={img} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
            {variantImage && (
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center">Selected variant image shown</p>
            )}
          </div>

          <div className="lg:w-1/2 space-y-6">
            <div className="space-y-4">
               <span className="text-[11px] font-black text-[#00a651] uppercase tracking-[2px] bg-[#e6fbf2] px-4 py-1.5 rounded-full inline-block">
                 {product.category}
               </span>
               <h1 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight leading-tight flex flex-wrap items-center gap-2">
                {product.name}
                {currentVariant && (
                  <span className="text-[#00a651] font-bold">
                    ({Object.values(currentVariant.attributeValues).join(', ')})
                  </span>
                )}
               </h1>
            </div>
            
            <div className="flex items-center gap-5 py-2">
              <span className="text-5xl font-black text-[#00a651] flex items-center gap-1.5">
                <span className="text-3xl font-medium">৳</span>{displayPrice.toFixed(2)}
              </span>
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <span className="text-3xl text-gray-300 line-through flex items-center gap-1.5 font-medium">
                  <span className="text-2xl">৳</span>{displayOriginalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Short Description Section Styled exactly as screenshot (Vertical Green Line) */}
            {product.shortDescription && (
              <div className="relative pl-8 py-1 my-6">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00a651] rounded-full"></div>
                <div 
                  className="text-[16px] text-gray-600 leading-relaxed italic prose prose-sm max-w-none font-medium"
                  dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                />
              </div>
            )}

            {/* Attribute Selectors Section */}
            {attributeList.map(attr => (
              <div key={attr.name} className="space-y-4 py-2">
                <span className="text-base font-black text-gray-800 uppercase tracking-widest block">{attr.name}</span>
                <div className="flex flex-wrap gap-4">
                  {attr.values.map((val) => {
                    const isActive = selectedAttrValues[attr.name] === val;
                    return (
                      <button
                        key={val}
                        onClick={() => handleAttrSelect(attr.name, val)}
                        className={`px-8 py-4 border-2 rounded-[15px] text-sm font-bold transition-all min-w-[110px] shadow-sm ${
                          isActive 
                          ? 'bg-[#00a651] border-black text-white shadow-xl' 
                          : 'bg-white border-gray-100 text-gray-500 hover:border-[#00a651]'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {selectionError && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1 duration-300">
                <Info size={18} />
                {selectionError}
              </div>
            )}

            <div className="flex items-center gap-6 pt-6">
              <div className="flex items-center border-2 border-gray-100 rounded-[20px] overflow-hidden h-16 shadow-sm bg-gray-50/50">
                <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="px-6 h-full hover:bg-white text-gray-400 hover:text-[#00a651] transition-colors"><Minus size={20} /></button>
                <span className="w-14 text-center font-black text-gray-800 text-xl">{quantity}</span>
                <button onClick={() => setQuantity(prev => prev + 1)} className="px-6 h-full hover:bg-white text-gray-400 hover:text-[#00a651] transition-colors"><Plus size={20} /></button>
              </div>
              <button 
                onClick={handleAddToCart}
                className={`flex-1 font-black py-5 px-10 rounded-[20px] transition-all flex items-center justify-center gap-4 h-16 shadow-2xl uppercase tracking-widest text-sm ${
                  product.variants && product.variants.length > 0 && !currentVariant
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-[#00a651] hover:bg-[#008c44] text-white shadow-emerald-100 active:scale-95'
                }`}
              >
                <ShoppingCart size={22} />
                Add To Cart
              </button>
            </div>
            
            <div className="pt-10 border-t border-gray-100 flex flex-wrap gap-12">
               <div className="flex flex-col gap-1.5"><span className="text-[11px] font-black text-gray-400 uppercase tracking-[2px]">SKU</span><span className="text-sm font-bold text-gray-800">{currentVariant?.sku || product.sku || 'N/A'}</span></div>
               <div className="flex flex-col gap-1.5"><span className="text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Brand</span><span className="text-sm font-bold text-gray-800">{product.brand || 'Universal'}</span></div>
               <div className="flex flex-col gap-1.5"><span className="text-[11px] font-black text-gray-400 uppercase tracking-[2px]">Unit</span><span className="text-sm font-bold text-gray-800">{product.unit || 'Piece'}</span></div>
            </div>
          </div>
        </div>

        {/* Detailed Info Section */}
        <div className="mt-24 bg-[#fcfcfc] rounded-[3rem] p-12 md:p-20 border border-gray-100">
           <h2 className="text-3xl font-black text-gray-800 uppercase tracking-widest mb-12 text-center">Product Information</h2>
           <div 
             className="bg-white p-12 md:p-16 rounded-[2.5rem] border border-gray-100 text-gray-600 leading-[2] text-lg prose prose-emerald max-w-none shadow-sm"
             dangerouslySetInnerHTML={{ __html: product.description || "No detailed description available for this product." }}
           />
        </div>

        {/* Reviews Section */}
        <div className="mt-24">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-4xl font-black text-[#004d40] tracking-tight uppercase">Customer Reviews</h2>
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
               <Star size={20} className="text-yellow-400 fill-current" />
               <span className="text-lg font-black text-emerald-800">{ratingStats.average} / 5.0</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-10">
              <div className="flex items-center gap-8">
                <span className="text-8xl font-black text-[#004d40] tracking-tighter">{ratingStats.average}</span>
                <div className="space-y-2">
                  <div className="font-black text-gray-800 uppercase text-sm tracking-[2px]">Store Rating</div>
                  <div className="flex text-yellow-400 gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={28} fill={i <= Number(ratingStats.average) ? "currentColor" : "none"} className={i <= Number(ratingStats.average) ? "" : "text-gray-200"} />
                    ))}
                  </div>
                  <span className="text-gray-400 text-xs font-black uppercase tracking-widest block pt-1">{ratingStats.total} Honest Reviews</span>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="text-lg font-bold text-gray-600 mb-8">{ratingStats.recommendedPercent}% Recommended by our shoppers</div>
                 {[5, 4, 3, 2, 1].map((star, idx) => {
                   const count = ratingStats.starCounts[idx];
                   const percent = ratingStats.total > 0 ? Math.round((count / ratingStats.total) * 100) : 0;
                   return (
                    <div key={star} className="flex items-center gap-6 group">
                      <span className="text-sm font-black text-gray-500 w-4">{star}</span>
                      <Star size={16} className="text-gray-300" />
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00a651] rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-400 w-10 text-right">{percent}%</span>
                    </div>
                   );
                 })}
              </div>
            </div>

            <div className="bg-white p-10 md:p-12 rounded-[3rem] border-2 border-gray-50 shadow-xl shadow-emerald-50/50 space-y-8">
              <div>
                <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tight">Share Your Thoughts</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Your feedback helps others shop better.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <textarea 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your experience with this product..." 
                    className="w-full border-2 border-gray-100 rounded-[25px] p-6 h-48 outline-none focus:border-[#00a651] focus:ring-8 focus:ring-emerald-50 transition-all text-base placeholder:text-gray-300 bg-gray-50/30"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Rate:</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star 
                          key={i} 
                          size={32} 
                          onClick={() => setReviewRating(i)}
                          className={`cursor-pointer transition-all hover:scale-125 active:scale-90 ${i <= reviewRating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview}
                    className="w-full sm:w-auto bg-[#004d40] hover:bg-black text-white font-black py-5 px-12 rounded-[20px] transition-all text-xs uppercase tracking-[2px] shadow-2xl disabled:opacity-50 active:scale-95"
                  >
                    {isSubmittingReview ? "Processing..." : "Submit Review"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-20 border-t border-gray-100">
            {productReviews.length === 0 ? (
              <div className="text-center py-24 opacity-40">
                 <MessageCircle size={64} className="mx-auto text-gray-200 mb-6" />
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No reviews found yet. Be the first to share!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {productReviews.map((rev) => (
                  <div key={rev.id} className="bg-gray-50/20 p-10 rounded-[2.5rem] border border-gray-100 hover:bg-white hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex gap-5 items-center">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                          {rev.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-black text-gray-800 text-base">{rev.authorName}</h4>
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex text-yellow-400 group-hover:scale-110 transition-transform">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill={i <= rev.rating ? "currentColor" : "none"} className={i <= rev.rating ? "" : "text-gray-200"} />)}
                      </div>
                    </div>
                    <p className="text-gray-600 text-[16px] leading-[1.8] font-medium italic">"{rev.comment}"</p>
                    
                    {rev.reply && (
                      <div className="mt-8 pl-8 border-l-4 border-[#00a651] py-4 bg-emerald-50/50 rounded-r-3xl">
                        <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[2px] block mb-3">Merchant Reply</span>
                        <p className="text-gray-800 text-[15px] font-bold leading-relaxed">"{rev.reply}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
