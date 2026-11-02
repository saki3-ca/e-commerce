import React, { useState } from 'react';
import { Camera, ExternalLink, Sparkles, ShoppingBag, Eye, Heart, ArrowUpRight, Check } from 'lucide-react';

export default function LookbookGallery({ onSelectProduct, products }) {
  const [activePhoto, setActivePhoto] = useState(null);

  const lookbookItems = [
    {
      id: 'look-1',
      title: 'FIOM Classic Monogram Crossbody',
      subtitle: 'Premium Cross body bags with both long and short belt',
      image: '/assets/lookbook_1_fiom.jpg',
      aspect: 'tall',
      tag: 'Bestseller Bag',
      productId: 'prod-1',
      badge: 'Dual Belt'
    },
    {
      id: 'look-2',
      title: 'Signature Clover Monogram Crossbody',
      subtitle: 'Styled with chic short hand strap for evening wear',
      image: '/assets/lookbook_2_clover.jpg',
      aspect: 'square',
      tag: 'New Arrival',
      productId: 'prod-2',
      badge: 'Clover Motif'
    },
    {
      id: 'look-3',
      title: 'Chocolate Ribbed Structured Leather',
      subtitle: 'Minimalist luxury finish with gold metal tabs',
      image: '/assets/lookbook_3_chocolate.jpg',
      aspect: 'wide',
      tag: 'Trending Style',
      productId: 'prod-3',
      badge: 'Vegan Leather'
    },
    {
      id: 'look-4',
      title: 'Royal Monogram Golden Crest Crossbody',
      subtitle: 'Hand-crafted emblem with dual detachable straps',
      image: '/assets/lookbook_5_gold_crest.jpg',
      aspect: 'tall',
      tag: 'Signature Crest',
      productId: 'prod-4',
      badge: 'Exclusive'
    },
    {
      id: 'look-5',
      title: 'Dual Straps & Handlet Detail',
      subtitle: 'Every bag comes with an adjustable long belt and wrist strap',
      image: '/assets/lookbook_4_handbag.jpg',
      aspect: 'square',
      tag: 'Included Free',
      productId: 'prod-1793647152080-757',
      badge: 'Versatile'
    },
    {
      id: 'look-6',
      title: 'Live Boutique Video Shoot',
      subtitle: 'Authentic product inspection and hardware finish',
      image: '/assets/bag_video_clean.jpg',
      aspect: 'tall',
      tag: 'Live Preview',
      productId: 'prod-1',
      badge: 'Real Video'
    },
    {
      id: 'look-7',
      title: 'Masfeeh Royal Brand Artwork',
      subtitle: 'Little Things... Big Happiness ♡ Accessorize Your World',
      image: '/assets/brand_artwork.jpg',
      aspect: 'square',
      tag: 'Boutique Collection',
      productId: 'prod-6',
      badge: 'Royal Crest'
    },
    {
      id: 'look-8',
      title: 'Pearl & Crystal Hair Accessories',
      subtitle: 'Handcrafted luxury hair clips and dainty pins',
      image: '/assets/photo_grid_0_0.jpg',
      aspect: 'square',
      tag: 'Hair Jewelry',
      productId: 'prod-5',
      badge: 'Handcrafted'
    }
  ];

  const handleOpenPhoto = (item) => {
    setActivePhoto(item);
  };

  const handleShopItem = (productId) => {
    const found = products?.find(p => p.id === productId);
    if (found) {
      setActivePhoto(null);
      onSelectProduct(found);
    }
  };

  return (
    <section className="py-12 bg-gradient-to-b from-white via-[#fcf9f6] to-[#faf6f2] border-t border-[#ede2da]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header with Facebook Page Link */}
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8 pb-4 border-b border-[#ebdcd3]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf5e6] text-[#997316] text-xs font-bold uppercase tracking-wider mb-2 border border-[#edd5ab]">
              <Camera className="w-3.5 h-3.5" />
              <span>Facebook Photo Gallery</span>
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-bold text-[#231b17]">
              Photos & Lookbook
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
              Authentic photoshoots and studio captures straight from our official Facebook gallery. Click any photo to inspect or shop the look!
            </p>
          </div>

          {/* Facebook Link Button */}
          <div>
            <a
              href="https://www.facebook.com/people/Masfeeh/61596179578624/?sk=photos"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:shadow-md cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>View All on Facebook Photos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Lookbook Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {lookbookItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenPhoto(item)}
              className="group relative rounded-xl overflow-hidden bg-stone-100 border border-[#ebdcd3] shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer aspect-square"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/bag_fiom.jpg';
                }}
              />

              {/* Tag Badge */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1f1d1d]/90 text-[#e6c89c] backdrop-blur-xs border border-white/20">
                  {item.badge}
                </span>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3.5 flex flex-col justify-end text-white">
                <span className="text-[10px] text-[#e8ca9c] font-semibold uppercase tracking-wider">
                  {item.tag}
                </span>
                <h4 className="font-serif-luxury text-xs sm:text-sm font-bold text-white line-clamp-1">
                  {item.title}
                </h4>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-stone-300 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>View Photo</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#c59b27] text-white font-bold text-[10px]">
                    Shop
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PHOTO LIGHTBOX MODAL */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActivePhoto(null)}
        >
          <div 
            className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer"
            >
              ✕
            </button>

            {/* High-res Image Preview */}
            <div className="relative aspect-4/3 w-full bg-stone-900 overflow-hidden">
              <img
                src={activePhoto.image}
                alt={activePhoto.title}
                className="w-full h-full object-contain object-center"
              />
              <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-[#1f1d1d]/90 text-[#e6c89c] backdrop-blur-xs">
                📸 Masfeeh Official Photo
              </span>
            </div>

            {/* Photo Info & Actions */}
            <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#997316]">
                  {activePhoto.tag}
                </span>
                <h3 className="font-serif-luxury text-lg sm:text-xl font-bold text-stone-900 mt-0.5">
                  {activePhoto.title}
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  {activePhoto.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="https://www.facebook.com/people/Masfeeh/61596179578624/?sk=photos"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </a>

                {activePhoto.productId && (
                  <button
                    onClick={() => handleShopItem(activePhoto.productId)}
                    className="px-4 py-2 bg-[#1f1d1d] hover:bg-[#382f29] text-[#e6c89c] text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Shop This Item</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
