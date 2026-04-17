'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Screenshot {
  id: number;
  image: string;
}

interface ScreenshotGalleryProps {
  screenshots: Screenshot[];
}

export function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (screenshots.length === 0) {
    return null;
  }

  const nextImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % screenshots.length);
    }
  };

  const prevImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + screenshots.length) % screenshots.length);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Скриншоты</h2>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {screenshots.map((screenshot, index) => (
          <button
            key={screenshot.id}
            onClick={() => setSelectedIndex(index)}
            className="group relative h-32 overflow-hidden rounded-lg border-2 border-slate-700 hover:border-violet-500 transition-all"
          >
            <Image
              src={screenshot.image}
              alt={`Скриншот ${index + 1}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </button>
        ))}
      </div>

      {/* Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute -top-12 right-0 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* Main Image */}
            <div className="relative h-96 sm:h-[500px] lg:h-[600px] bg-black rounded-lg overflow-hidden">
              <Image
                src={screenshots[selectedIndex].image}
                alt={`Скриншот ${selectedIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={prevImage}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="text-slate-400">
                {selectedIndex + 1} / {screenshots.length}
              </div>

              <button
                onClick={nextImage}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
