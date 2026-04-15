'use client';

import { ExternalLink, MessageSquare, ArrowUpCircle } from 'lucide-react';
import Image from 'next/image';

interface RedditPost {
  id: string;
  name: string;
  text: string;
  image: string | null;
  url: string;
  username: string;
  username_url: string;
  created: string;
}

interface CommunityDiscussionsProps {
  posts: RedditPost[];
}

export function CommunityDiscussions({ posts }: CommunityDiscussionsProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-white flex items-center gap-3">
        <MessageSquare className="text-orange-500" />
        Комьюнити & Советы
      </h3>
      <p className="text-slate-400 text-sm mb-6">Самые интересные обсуждения Reddit об этой игре.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.slice(0, 6).map((post) => (
          <a
            key={post.id}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 hover:border-orange-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-1"
          >
            {post.image && !post.image.includes('default') && (
              <div className="relative h-32 w-full overflow-hidden bg-slate-900 border-b border-slate-700/50">
                <Image
                  src={post.image}
                  alt={post.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div className="p-4 flex-1 flex flex-col">
              <h4 className="font-semibold text-slate-200 text-sm line-clamp-2 leading-relaxed group-hover:text-orange-400 transition-colors">
                {post.name}
              </h4>
              <p className="text-xs text-slate-500 mt-2 line-clamp-3">
                {post.text?.replace(/&amp;/g, '&') || 'Нажми, чтобы прочитать обсуждение на Reddit.'}
              </p>
              
              <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium text-orange-500/80 group-hover:text-orange-500">
                  u/{post.username}
                </span>
                <span className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <ExternalLink size={14} /> Reddit
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
