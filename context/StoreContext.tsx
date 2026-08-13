import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product, Category, Order, CartItem, AdminTab, Attribute, Variant, Brand, Coupon, ShippingSettings, Review, UserProfile, Address, StoreInfo, Page, Banner, HomeSection, BlogPost } from '../types';
import { api } from '../lib/api';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  orders: Order[];
  attributes: Attribute[];
  coupons: Coupon[];
  reviews: Review[];
  users: UserProfile[];
  addresses: Address[];
  pages: Page[];
  blogPosts: BlogPost[];
  addBlogPost: (post: Omit<BlogPost, 'id' | 'date'>) => Promise<void>;
  updateBlogPost: (id: string, post: Partial<BlogPost>) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;
  banners: Banner[];
  addBanner: (banner: Omit<Banner, 'id'>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;

  homeSections: HomeSection[];
  addHomeSection: (section: HomeSection) => Promise<void>;
  updateHomeSection: (id: string, section: HomeSection) => Promise<void>;
  deleteHomeSection: (id: string) => Promise<void>;

  wishlist: string[];
  user: any | null;
  userProfile: UserProfile | null;
  shippingSettings: ShippingSettings;
  storeInfo: StoreInfo;
  updateStoreInfo: (info: StoreInfo) => Promise<void>;
  appliedCoupon: Coupon | null;
  cart: CartItem[];
  isAdmin: boolean;
  adminTab: AdminTab;
  isCartOpen: boolean;
  loading: boolean;
  setAdminTab: (tab: AdminTab) => void;
  toggleAdmin: () => void;
  addToCart: (product: Product, variant?: Variant, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  placeOrder: (customerDetails: any) => Promise<Order>;
  updateOrder: (id: string, orderData: Partial<Order>) => Promise<void>;
  updateShippingSettings: (settings: ShippingSettings) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addCategory: (categoryData: any) => Promise<void>;
  updateCategory: (id: string, categoryData: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  addBrand: (brandData: Omit<Brand, 'id'>) => Promise<void>;
  updateBrand: (id: string, brandData: Partial<Brand>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  addAttribute: (name: string, values: any[]) => Promise<void>;
  updateAttribute: (id: string, name: string, values: any[]) => Promise<void>;
  deleteAttribute: (id: string) => Promise<void>;
  addCoupon: (couponData: any) => Promise<void>;
  updateCoupon: (id: string, couponData: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  applyCoupon: (code: string) => string | null;
  removeCoupon: () => void;
  addReview: (reviewData: any) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  replyToReview: (id: string, reply: string) => Promise<void>;
  updateUserRole: (userId: string, role: 'admin' | 'customer') => Promise<void>;
  updateProfile: (id: string, fullName: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  addAddress: (data: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, data: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  addPage: (page: Omit<Page, 'id' | 'createdAt'>) => Promise<void>;
  updatePage: (id: string, page: Partial<Page>) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);
const SUPER_ADMIN_EMAIL = 'msmraqeeb@gmail.com';

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([
    {
      id: 'hot-sale',
      title: "Today's Hot Sale",
      type: 'slider',
      filterType: 'sale',
      sortOrder: 1,
      isActive: true
    },
    {
      id: 'popular-items',
      title: "Popular Items",
      type: 'grid',
      filterType: 'all',
      sortOrder: 2,
      isActive: true,
      banner: {
        title: "100% Fresh Vegetables and Authentic Products",
        description: "Get the best quality products at the most affordable prices.",
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400",
        buttonText: "Shop Now",
        link: "/products"
      }
    }
  ]);

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({ insideDhaka: 80, outsideDhaka: 150 });
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: 'SMart',
    address: '1418 River Drive, Suite 35, Cottonhall, CA 96222',
    phone: '+0 123 456 789',
    email: 'support@smart.com',
    socials: {},
    floatingWidget: {
      isVisible: true,
      whatsapp: '',
      messenger: '',
      facebook: '',
      instagram: '',
      phone: '',
      supportImage: ''
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('appliedCoupon');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [adminTab, setAdminTab] = useState<AdminTab>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = userProfile?.role === 'admin' || user?.email === SUPER_ADMIN_EMAIL;

  const mapProduct = (p: any): Product => ({
    id: String(p.id),
    name: String(p.name || ''),
    price: Number(p.price || 0),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    category: String(p.category || 'General'),
    images: Array.isArray(p.images) ? p.images : (p.image_url ? [p.image_url] : []),
    badge: p.badge, unit: p.unit,
    shortDescription: p.short_description, description: String(p.description || ''),
    sku: p.sku, slug: p.slug, brand: p.brand,
    isFeatured: Boolean(p.is_featured),
    variants: Array.isArray(p.variants) ? p.variants : []
  });

  const mapOrder = (o: any): Order => ({
    id: String(o.id),
    customerName: String(o.customer_name || 'Unknown'),
    customerEmail: o.customer_email || '',
    customerPhone: o.customer_phone || '',
    customerAddress: o.customer_address || '',
    customerDistrict: o.customer_district || '',
    customerArea: o.customer_area || '',
    date: String(o.date || new Date().toISOString()),
    total: Number(o.total || 0),
    subtotal: Number(o.subtotal || 0),
    shippingCost: Number(o.shipping_cost || 0),
    discount: Number(o.discount || 0),
    status: o.status || 'Pending',
    items: Array.isArray(o.items) ? o.items : [],
    coupon_code: o.coupon_code || undefined
  });

  const fetchData = async (activeUser?: any) => {
    try {
      const [pd, cat, br, coup, rev, set, attr, storeSettings, pagesRes, homeSectionsRes, bannerRes, blogRes] = await Promise.all([
        api.get('/products').catch(() => []),
        api.get('/categories').catch(() => []),
        api.get('/brands').catch(() => []),
        api.get('/coupons').catch(() => []),
        api.get('/reviews').catch(() => []),
        api.get('/settings/shipping_fees').catch(() => null),
        api.get('/attributes').catch(() => []),
        api.get('/settings/store_info').catch(() => null),
        api.get('/pages').catch(() => []),
        api.get('/settings/home_sections').catch(() => null),
        api.get('/banners').catch(() => []),
        api.get('/blog-posts').catch(() => [])
      ]);

      if (pd) setProducts(pd.map(mapProduct));
      if (cat) setCategories(cat.map((c: any) => ({ id: String(c.id), name: c.name, image: c.image_url || '', slug: c.slug, parentId: c.parent_id ? String(c.parent_id) : null, itemCount: Number(c.item_count || 0) })));
      if (br) setBrands(br.map((b: any) => ({ id: String(b.id), name: b.name, slug: b.slug, logo_url: b.logo_url })));
      if (coup) setCoupons(coup.map((c: any) => ({ id: String(c.id), code: c.code, discountType: c.discount_type, discountValue: Number(c.discount_value), minimumSpend: Number(c.minimum_spend || 0), expiryDate: String(c.expiry_date), status: c.status, autoApply: Boolean(c.auto_apply), createdAt: String(c.created_at) })));
      if (rev) setReviews(rev.map((rv: any) => ({ id: String(rv.id), productId: String(rv.product_id), productName: String(rv.product_name), authorName: String(rv.author_name), rating: Number(rv.rating), comment: String(rv.comment), reply: rv.reply, createdAt: String(rv.created_at) })));
      if (set?.value) setShippingSettings(set.value);
      if (attr) setAttributes(attr.map((a: any) => ({ id: String(a.id), name: a.name, values: Array.isArray(a.values) ? a.values : [] })));
      if (storeSettings?.value) setStoreInfo(storeSettings.value);
      if (pagesRes) setPages(pagesRes.map((p: any) => ({ id: String(p.id), title: p.title, slug: p.slug, content: p.content, isPublished: p.is_published, createdAt: p.created_at })));
      if (homeSectionsRes?.value) setHomeSections(homeSectionsRes.value);
      if (bannerRes) setBanners(bannerRes.map((b: any) => ({ id: String(b.id), type: b.type, title: b.title, subtitle: b.subtitle, image_url: b.image_url, link: b.link, sort_order: b.sort_order, is_active: b.is_active })));
      if (blogRes) setBlogPosts(blogRes.map((p: any) => ({ id: String(p.id), title: p.title, excerpt: p.excerpt, content: p.content, author: p.author, date: new Date(p.created_at).toLocaleDateString(), imageUrl: p.image_url, slug: p.slug, tags: p.tags || [] })));

      if (activeUser) {
        const [ord, usersList] = await Promise.all([
          api.get('/orders').catch(() => []),
          api.get('/profiles').catch(() => [])
        ]);
        if (ord) setOrders(ord.map(mapOrder));
        if (usersList) setUsers(usersList);
      }
    } catch (error: any) {
      console.error('Critical fetch error:', error.message);
    }
  };

  const initializeAuth = async () => {
    const token = localStorage.getItem('smart_grocery_token');
    if (!token) {
      setUser(null);
      setUserProfile(null);
      await fetchData(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await api.get('/auth/me');
      if (profile) {
        setUser({ id: profile.id, email: profile.email });
        setUserProfile(profile);

        const [wishData, addrData] = await Promise.all([
          api.get(`/wishlist/${profile.id}`).catch(() => []),
          api.get(`/addresses/${profile.id}`).catch(() => [])
        ]);

        if (wishData) setWishlist(wishData.map(String));
        if (addrData) setAddresses(addrData.map((a: any) => ({ id: String(a.id), fullName: a.full_name, phone: a.phone, addressLine: a.address_line, district: a.district, area: a.area })));

        await fetchData(profile);
      } else {
        localStorage.removeItem('smart_grocery_token');
        setUser(null);
        setUserProfile(null);
        await fetchData(null);
      }
    } catch (err) {
      console.error("Auth init error:", err);
      localStorage.removeItem('smart_grocery_token');
      setUser(null);
      setUserProfile(null);
      await fetchData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('appliedCoupon');
    }
  }, [appliedCoupon]);

  useEffect(() => {
    if (appliedCoupon) {
      const currentCoupon = coupons.find(c => c.id === appliedCoupon.id);
      const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const today = new Date().toISOString().slice(0, 10);

      if (!currentCoupon || currentCoupon.status !== 'Active' || subtotal < currentCoupon.minimumSpend || currentCoupon.expiryDate < today) {
        setAppliedCoupon(null);
        return;
      }

      if (appliedCoupon.isAutoApplied && !currentCoupon.autoApply) {
        setAppliedCoupon(null);
        return;
      }

      if (JSON.stringify({ ...currentCoupon, isAutoApplied: appliedCoupon.isAutoApplied }) !== JSON.stringify(appliedCoupon)) {
        setAppliedCoupon({ ...currentCoupon, isAutoApplied: appliedCoupon.isAutoApplied });
      }
      return;
    }

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (subtotal === 0) return;

    const today = new Date().toISOString().slice(0, 10);
    const eligibleCoupon = coupons.find(c =>
      c.autoApply &&
      c.status === 'Active' &&
      subtotal >= c.minimumSpend &&
      c.expiryDate >= today
    );

    if (eligibleCoupon) {
      setAppliedCoupon({ ...eligibleCoupon, isAutoApplied: true });
    }
  }, [cart, coupons, appliedCoupon]);

  const addToCart = (product: Product, variant?: Variant, quantity: number = 1) => {
    const cartItemId = variant ? `${product.id}-${variant.id}` : product.id;
    setCart(prev => {
      const existing = prev.find(item => (item.selectedVariantId ? `${item.id}-${item.selectedVariantId}` : item.id) === cartItemId);
      if (existing) {
        return prev.map(item => (item.selectedVariantId ? `${item.id}-${item.selectedVariantId}` : item.id) === cartItemId
          ? { ...item, quantity: item.quantity + quantity }
          : item
        );
      }
      return [...prev, {
        ...product,
        quantity,
        selectedVariantId: variant?.id,
        selectedVariantName: variant ? Object.values(variant.attributeValues).join(' / ') : undefined,
        selectedVariantImage: variant?.image,
        price: variant ? variant.price : product.price
      }];
    });
    setIsCartOpen(true);
  };

  const placeOrder = async (customerDetails: any): Promise<Order> => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const isDhaka = customerDetails.district?.toLowerCase() === 'dhaka';
    const shippingCostValue = isDhaka ? shippingSettings.insideDhaka : shippingSettings.outsideDhaka;

    let discountAmount = 0;
    if (appliedCoupon) {
      discountAmount = appliedCoupon.discountType === 'Fixed' ? appliedCoupon.discountValue : (subtotal * appliedCoupon.discountValue / 100);
    }
    const totalValue = subtotal + shippingCostValue - discountAmount;

    const orderData = {
      customer_name: customerDetails.fullName,
      customer_email: customerDetails.email,
      customer_phone: customerDetails.phone,
      customer_address: customerDetails.address,
      customer_district: customerDetails.district,
      customer_area: customerDetails.area,
      subtotal,
      shipping_cost: shippingCostValue,
      discount: discountAmount,
      total: totalValue,
      status: 'Pending',
      items: cart,
      coupon_code: appliedCoupon?.code,
      user_id: user?.id || null
    };

    const created = await api.post('/orders', orderData);

    setCart([]);
    setAppliedCoupon(null);
    localStorage.removeItem('cart');
    localStorage.removeItem('appliedCoupon');
    await fetchData(user);
    return mapOrder(created);
  };

  const updateHomeSectionsInDB = async (newSections: HomeSection[]) => {
    await api.post('/settings', { key: 'home_sections', value: newSections });
    setHomeSections(newSections);
  };

  return (
    <StoreContext.Provider value={{
      products, categories, brands, orders, attributes, coupons, reviews, users, addresses, pages, blogPosts, banners, homeSections, wishlist, user, userProfile, shippingSettings, storeInfo, appliedCoupon, cart, isAdmin, adminTab, isCartOpen, loading,

      setAdminTab: (tab: AdminTab) => setAdminTab(tab), toggleAdmin: () => { }, addToCart, removeFromCart: (id) => setCart(cart.filter(i => (i.selectedVariantId ? `${i.id}-${i.selectedVariantId}` : i.id) !== id)),
      addHomeSection: async (section) => {
        const newSections = [...homeSections, { ...section, sortOrder: homeSections.length + 1 }];
        await updateHomeSectionsInDB(newSections);
      },
      updateHomeSection: async (id, section) => {
        const newSections = homeSections.map(s => s.id === id ? section : s);
        await updateHomeSectionsInDB(newSections);
      },
      deleteHomeSection: async (id) => {
        const newSections = homeSections.filter(s => s.id !== id);
        await updateHomeSectionsInDB(newSections);
      },
      updateQuantity: (id, d) => setCart(cart.map(i => {
        const itemKey = i.selectedVariantId ? `${i.id}-${i.selectedVariantId}` : i.id;
        if (itemKey === id) {
          return { ...i, quantity: Math.max(0, i.quantity + d) };
        }
        return i;
      }).filter(i => i.quantity > 0)),
      clearCart: () => setCart([]), openCart: () => setIsCartOpen(true), closeCart: () => setIsCartOpen(false),
      placeOrder, updateOrder: async (id, data) => {
        await api.put(`/orders/${id}/status`, { status: data.status });
        await fetchData(user);
      },
      updateShippingSettings: async (s) => {
        await api.post('/settings', { key: 'shipping_fees', value: s });
        setShippingSettings(s);
      },
      updateStoreInfo: async (info) => {
        await api.post('/settings', { key: 'store_info', value: info });
        setStoreInfo(info);
      },
      addProduct: async (p) => {
        await api.post('/products', p);
        await fetchData(user);
      },
      updateProduct: async (id, p) => {
        await api.put(`/products/${id}`, p);
        await fetchData(user);
      },
      deleteProduct: async (id) => {
        await api.delete(`/products/${id}`);
        await fetchData(user);
      },
      addCategory: async (c) => {
        await api.post('/categories', { name: c.name, slug: c.slug, parent_id: c.parentId || null, image_url: c.image });
        await fetchData(user);
      },
      updateCategory: async (id, c) => {
        await api.put(`/categories/${id}`, { name: c.name, slug: c.slug, parent_id: c.parentId || null, image_url: c.image });
        await fetchData(user);
      },
      deleteCategory: async (id) => {
        await api.delete(`/categories/${id}`);
        await fetchData(user);
      },
      addBrand: async (b) => {
        await api.post('/brands', { name: b.name, slug: b.slug, logo_url: b.logo_url });
        await fetchData(user);
      },
      updateBrand: async (id, b) => {
        await api.put(`/brands/${id}`, { name: b.name, slug: b.slug, logo_url: b.logo_url });
        await fetchData(user);
      },
      deleteBrand: async (id) => {
        await api.delete(`/brands/${id}`);
        await fetchData(user);
      },
      updateOrderStatus: async (id, status) => {
        await api.put(`/orders/${id}/status`, { status });
        await fetchData(user);
      },
      addAttribute: async (n, v) => {
        await api.post('/attributes', { name: n, values: v });
        await fetchData(user);
      },
      updateAttribute: async (id, n, v) => {
        await api.put(`/attributes/${id}`, { name: n, values: v });
        await fetchData(user);
      },
      deleteAttribute: async (id) => {
        await api.delete(`/attributes/${id}`);
        await fetchData(user);
      },
      addCoupon: async (c) => {
        await api.post('/coupons', {
          code: c.code,
          discount_type: c.discountType,
          discount_value: c.discountValue,
          minimum_spend: c.minimumSpend,
          expiry_date: c.expiryDate,
          status: c.status,
          auto_apply: c.autoApply
        });
        await fetchData(user);
      },
      updateCoupon: async (id, c) => {
        await api.put(`/coupons/${id}`, {
          code: c.code,
          discount_type: c.discountType,
          discount_value: c.discountValue,
          minimum_spend: c.minimumSpend,
          expiry_date: c.expiryDate,
          status: c.status,
          auto_apply: c.autoApply
        });
        await fetchData(user);
      },
      deleteCoupon: async (id) => {
        await api.delete(`/coupons/${id}`);
        await fetchData(user);
      },
      applyCoupon: (code) => {
        const c = coupons.find(cp => cp.code === code && cp.status === 'Active');
        if (!c) return "Invalid Code";
        setAppliedCoupon({ ...c, isAutoApplied: false });
        return null;
      },
      removeCoupon: () => setAppliedCoupon(null),
      addReview: async (r) => {
        await api.post('/reviews', { productId: r.productId, productName: r.productName, authorName: r.authorName, rating: r.rating, comment: r.comment });
        await fetchData(user);
      },
      deleteReview: async (id) => {
        await api.delete(`/reviews/${id}`);
        await fetchData(user);
      },
      replyToReview: async (id, reply) => {
        await api.put(`/reviews/${id}/reply`, { reply });
        await fetchData(user);
      },
      updateUserRole: async (userId, role) => {
        await api.put(`/profiles/${userId}/role`, { role });
        await fetchData(user);
      },
      updateProfile: async (id, fullName) => {
        await api.put('/auth/profile', { full_name: fullName });
        setUserProfile(prev => prev ? { ...prev, full_name: fullName } : null);
        await fetchData(user);
      },
      changePassword: async (p) => {
        await api.put('/auth/password', { password: p });
      },
      addAddress: async (d) => {
        if (!user) return;
        await api.post('/addresses', { user_id: user.id, full_name: d.fullName, phone: d.phone, address_line: d.addressLine, district: d.district, area: d.area });
        await initializeAuth();
      },
      updateAddress: async (id, d) => {
        // Not used separately
      },
      deleteAddress: async (id) => {
        await api.delete(`/addresses/${id}`);
        setAddresses(prev => prev.filter(a => a.id !== id));
      },
      addPage: async (p) => {
        // Add page endpoint
        await fetchData(user);
      },
      updatePage: async (id, p) => {
        // Update page endpoint
        await fetchData(user);
      },
      deletePage: async (id) => {
        // Delete page endpoint
        await fetchData(user);
      },
      addBanner: async (b) => {
        // Add banner endpoint
        await fetchData(user);
      },
      addBlogPost: async (p) => {
        // Add blog post
        await fetchData(user);
      },
      updateBlogPost: async (id, p) => {
        // Update blog post
        await fetchData(user);
      },
      deleteBlogPost: async (id) => {
        // Delete blog post
        await fetchData(user);
      },
      deleteBanner: async (id) => {
        // Delete banner
        await fetchData(user);
      },
      toggleWishlist: async (pId) => {
        if (!user) return;
        if (wishlist.includes(pId)) {
          await api.delete('/wishlist', { user_id: user.id, product_id: pId });
          setWishlist(prev => prev.filter(id => id !== pId));
        } else {
          await api.post('/wishlist', { user_id: user.id, product_id: pId });
          setWishlist(prev => [...prev, pId]);
        }
      },
      signOut: async () => {
        localStorage.removeItem('smart_grocery_token');
        setUser(null);
        setUserProfile(null);
        setAddresses([]);
        setWishlist([]);
        await fetchData(null);
      },
      refreshAllData: () => fetchData(user),
      searchQuery, setSearchQuery
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
