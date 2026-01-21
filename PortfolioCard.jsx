// src/components/ui/PortfolioCard.jsx
import React, { useState } from 'react';
import { Play, Trash2, Eye, ExternalLink } from 'lucide-react';

export default function PortfolioCard({ 
  item, 
  isAdminMode = false, 
  onDelete 
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(item.id, item.title);
  };

  const handleVideoClick = (e) => {
    e.stopPropagation();
    if (item.videoUrl && item.videoUrl !== '#') {
      window.open(item.videoUrl, '_blank');
    }
  };

  return (
    <div className="group relative bg-[#131a2d] border border-white/5 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden">
      {/* Thumbnail Section */}
      <div className="relative aspect-video overflow-hidden bg-gray-900">
        {/* Loading Skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        )}

        {/* Image */}
        {!imageError ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
            <Play size={48} />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          {item.videoUrl && item.videoUrl !== '#' && (
            <button
              onClick={handleVideoClick}
              className="p-4 bg-cyan-600 text-white rounded-full hover:bg-cyan-500 transform hover:scale-110 transition-all shadow-lg hover:shadow-cyan-500/50"
              aria-label="Play Video"
            >
              <Play size={24} fill="white" />
            </button>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-black/80 px-3 py-1.5 text-xs font-rajdhani font-bold text-cyan-400 border border-cyan-500/30 uppercase tracking-wider backdrop-blur-sm">
          {item.category}
        </div>

        {/* Views Badge */}
        {item.views && (
          <div className="absolute top-3 right-3 bg-black/80 px-3 py-1.5 text-xs font-rajdhani font-semibold text-white border border-white/20 flex items-center gap-1.5 backdrop-blur-sm">
            <Eye size={12} />
            {item.views}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-rajdhani font-bold text-white mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {item.title}
        </h3>

        {/* Footer Actions */}
        <div className="flex justify-between items-center">
          {/* Date */}
          {item.createdAt && (
            <span className="text-xs font-space text-gray-500">
              {new Date(item.createdAt.seconds * 1000).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          )}

          {/* Admin Actions */}
          {isAdminMode && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-all"
              aria-label="Delete Portfolio"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Shine Effect on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>
    </div>
  );
}
