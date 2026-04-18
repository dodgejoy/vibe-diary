'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  Search, Upload, Trash2, Plus, X, Save, Loader,
  Image as ImageIcon, FileText, Tag, Sparkles, ChevronRight,
  Pencil, Eye, ArrowLeft,
} from 'lucide-react';
import { useTranslation } from '@/i18n';
import { searchGames } from '@/lib/rawg';
import {
  fetchAllGameCustomContent,
  fetchGameCustomContent,
  saveGameCustomContent,
  deleteGameCustomContent,
  uploadGameContentFile,
  type GameCustomContent,
} from '@/lib/supabase';

interface RAWGSearchResult {
  id: number;
  name: string;
  background_image?: string;
  released?: string;
}

type EditorState = {
  logo_url: string | null;
  banner_url: string | null;
  description: string;
  tags: string[];
  screenshots: string[];
};

export function ContentManager() {
  const { t } = useTranslation();
  const [allContent, setAllContent] = useState<GameCustomContent[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [view, setView] = useState<'list' | 'editor'>('list');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RAWGSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Editor state
  const [editingGame, setEditingGame] = useState<{ rawgId: number; name: string; image: string | null } | null>(null);
  const [editor, setEditor] = useState<EditorState>({
    logo_url: null, banner_url: null, description: '', tags: [], screenshots: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load all custom content entries
  const loadAllContent = useCallback(async () => {
    setIsLoadingList(true);
    const data = await fetchAllGameCustomContent();
    setAllContent(data);
    setIsLoadingList(false);
  }, []);

  useEffect(() => { loadAllContent(); }, [loadAllContent]);

  // Search games from RAWG
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim()) { setSearchResults([]); return; }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchGames(query);
        setSearchResults((results || []).slice(0, 8));
      } catch {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 400);
  }, []);

  // Open editor for a game
  const openEditor = useCallback(async (rawgId: number, name: string, image: string | null) => {
    setEditingGame({ rawgId, name, image });
    setView('editor');
    setSaveMessage(null);

    // Load existing content if any
    const existing = await fetchGameCustomContent(rawgId);
    if (existing) {
      setEditor({
        logo_url: existing.logo_url,
        banner_url: existing.banner_url,
        description: existing.description || '',
        tags: existing.tags || [],
        screenshots: existing.screenshots || [],
      });
    } else {
      setEditor({ logo_url: null, banner_url: null, description: '', tags: [], screenshots: [] });
    }
    setTagInput('');
  }, []);

  // File upload handler
  const handleFileUpload = useCallback(async (
    file: File,
    type: 'logo' | 'banner' | 'screenshot'
  ) => {
    if (!editingGame) return;
    setIsUploading(type);
    const ext = file.name.split('.').pop() || 'png';
    const timestamp = Date.now();
    const path = type === 'screenshot'
      ? `screenshots/${editingGame.rawgId}/${timestamp}.${ext}`
      : `${type}s/${editingGame.rawgId}.${ext}`;

    const result = await uploadGameContentFile(file, path);
    if (result.error || !result.url) {
      setSaveMessage({ type: 'error', text: result.error || 'Upload failed' });
    } else {
      if (type === 'logo') {
        setEditor(prev => ({ ...prev, logo_url: result.url }));
      } else if (type === 'banner') {
        setEditor(prev => ({ ...prev, banner_url: result.url }));
      } else {
        setEditor(prev => ({ ...prev, screenshots: [...prev.screenshots, result.url!] }));
      }
    }
    setIsUploading(null);
  }, [editingGame]);

  // Save content
  const handleSave = useCallback(async () => {
    if (!editingGame) return;
    setIsSaving(true);
    setSaveMessage(null);

    const result = await saveGameCustomContent(editingGame.rawgId, editingGame.name, {
      logo_url: editor.logo_url,
      banner_url: editor.banner_url,
      description: editor.description || null,
      tags: editor.tags,
      screenshots: editor.screenshots,
    });

    if (result.error) {
      setSaveMessage({ type: 'error', text: result.error });
    } else {
      setSaveMessage({ type: 'success', text: t('contentManager.saved') });
      loadAllContent();
    }
    setIsSaving(false);
  }, [editingGame, editor, t, loadAllContent]);

  // Delete all content for a game
  const handleDelete = useCallback(async (rawgId: number) => {
    const result = await deleteGameCustomContent(rawgId);
    if (!result.error) {
      setAllContent(prev => prev.filter(c => c.game_rawg_id !== rawgId));
      if (editingGame?.rawgId === rawgId) {
        setView('list');
        setEditingGame(null);
      }
    }
  }, [editingGame]);

  // Add tag
  const addTag = useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !editor.tags.includes(tag)) {
      setEditor(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  }, [tagInput, editor.tags]);

  // Remove screenshot
  const removeScreenshot = useCallback((url: string) => {
    setEditor(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter(s => s !== url),
    }));
  }, []);

  // --- LIST VIEW ---
  if (view === 'list') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{t('contentManager.title')}</h2>
            <p className="text-sm text-slate-400 mt-1">{t('contentManager.subtitle')}</p>
          </div>
        </div>

        {/* Search to add new game content */}
        <div className="relative">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t('contentManager.searchPlaceholder')}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-slate-900/60 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
            {isSearching && (
              <Loader size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-400 animate-spin" />
            )}
          </div>

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-20 top-full mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden">
              {searchResults.map((game) => (
                <button
                  key={game.id}
                  onClick={() => {
                    openEditor(game.id, game.name, game.background_image ?? null);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                    {game.background_image ? (
                      <Image src={game.background_image} alt="" width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={20} className="text-slate-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold truncate">{game.name}</div>
                    {game.released && (
                      <div className="text-xs text-slate-500">{game.released.slice(0, 4)}</div>
                    )}
                  </div>
                  <Plus size={18} className="text-violet-400 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Existing content list */}
        {isLoadingList ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="animate-spin text-violet-400" size={28} />
          </div>
        ) : allContent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Sparkles size={40} className="text-slate-600 mb-4" />
            <p className="text-slate-400 font-medium">{t('contentManager.empty')}</p>
            <p className="text-sm text-slate-500 mt-1">{t('contentManager.emptyHint')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allContent.map((content) => (
              <div
                key={content.id}
                className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-slate-900/40 hover:bg-slate-900/60 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                  {content.logo_url || content.banner_url ? (
                    <Image src={content.logo_url || content.banner_url!} alt="" width={56} height={56} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={22} className="text-slate-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold truncate">{content.game_name}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    {content.description && <span className="flex items-center gap-1"><FileText size={12} /> {t('contentManager.hasDescription')}</span>}
                    {content.tags.length > 0 && <span className="flex items-center gap-1"><Tag size={12} /> {content.tags.length}</span>}
                    {content.screenshots.length > 0 && <span className="flex items-center gap-1"><ImageIcon size={12} /> {content.screenshots.length}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditor(content.game_rawg_id, content.game_name, content.logo_url || content.banner_url)}
                    className="p-2 rounded-xl border border-white/10 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    title={t('contentManager.edit')}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(content.game_rawg_id)}
                    className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                    title={t('contentManager.delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- EDITOR VIEW ---
  return (
    <div className="space-y-6">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setView('list'); setEditingGame(null); }}
          className="p-2 rounded-xl border border-white/10 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white truncate">{editingGame?.name}</h2>
          <p className="text-sm text-slate-500">RAWG ID: {editingGame?.rawgId}</p>
        </div>
        <a
          href={`/games/${editingGame?.rawgId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl border border-white/10 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title={t('contentManager.viewPage')}
        >
          <Eye size={18} />
        </a>
      </div>

      {/* Logo upload */}
      <Section title={t('contentManager.logo')} icon={<ImageIcon size={16} />}>
        <FileUploadZone
          currentUrl={editor.logo_url}
          isUploading={isUploading === 'logo'}
          onUpload={(file) => handleFileUpload(file, 'logo')}
          onRemove={() => setEditor(prev => ({ ...prev, logo_url: null }))}
          label={t('contentManager.uploadLogo')}
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
        />
      </Section>

      {/* Banner upload */}
      <Section title={t('contentManager.banner')} icon={<ImageIcon size={16} />}>
        <FileUploadZone
          currentUrl={editor.banner_url}
          isUploading={isUploading === 'banner'}
          onUpload={(file) => handleFileUpload(file, 'banner')}
          onRemove={() => setEditor(prev => ({ ...prev, banner_url: null }))}
          label={t('contentManager.uploadBanner')}
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          wide
        />
      </Section>

      {/* Description */}
      <Section title={t('contentManager.description')} icon={<FileText size={16} />}>
        <textarea
          value={editor.description}
          onChange={(e) => setEditor(prev => ({ ...prev, description: e.target.value }))}
          placeholder={t('contentManager.descriptionPlaceholder')}
          rows={5}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-y transition-colors"
        />
      </Section>

      {/* Tags */}
      <Section title={t('contentManager.tags')} icon={<Tag size={16} />}>
        <div className="flex flex-wrap gap-2 mb-3">
          {editor.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/20 text-violet-200 text-sm font-medium">
              {tag}
              <button onClick={() => setEditor(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))} className="text-violet-400 hover:text-white">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            placeholder={t('contentManager.tagPlaceholder')}
            className="flex-1 rounded-xl border border-white/10 bg-slate-950/50 px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm transition-colors"
          />
          <button
            onClick={addTag}
            disabled={!tagInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-40"
          >
            <Plus size={16} />
          </button>
        </div>
      </Section>

      {/* Screenshots */}
      <Section title={t('contentManager.screenshots')} icon={<ImageIcon size={16} />}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {editor.screenshots.map((url) => (
            <div key={url} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-slate-800">
              <Image src={url} alt="" fill className="object-cover" />
              <button
                onClick={() => removeScreenshot(url)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {/* Upload zone */}
          <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 aspect-video cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-colors">
            {isUploading === 'screenshot' ? (
              <Loader size={22} className="text-violet-400 animate-spin" />
            ) : (
              <>
                <Upload size={22} className="text-slate-500 mb-1" />
                <span className="text-xs text-slate-500">{t('contentManager.addScreenshot')}</span>
              </>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'screenshot');
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </Section>

      {/* Save message */}
      {saveMessage && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${
          saveMessage.type === 'success'
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
            : 'border-rose-500/20 bg-rose-500/10 text-rose-200'
        }`}>
          {saveMessage.text}
        </div>
      )}

      {/* Save bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all disabled:opacity-60"
        >
          {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? t('controlPanel.saving') : t('common.save')}
        </button>
        <button
          onClick={() => handleDelete(editingGame!.rawgId)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 font-semibold transition-all"
        >
          <Trash2 size={16} />
          {t('contentManager.deleteAll')}
        </button>
      </div>
    </div>
  );
}

// --- Helper sub-components ---

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
      <h3 className="flex items-center gap-2 text-white font-semibold text-sm mb-4">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function FileUploadZone({
  currentUrl, isUploading, onUpload, onRemove, label, accept, wide,
}: {
  currentUrl: string | null;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  label: string;
  accept: string;
  wide?: boolean;
}) {
  if (currentUrl) {
    return (
      <div className={`relative group rounded-xl overflow-hidden border border-white/10 bg-slate-800 ${wide ? 'aspect-[3/1]' : 'w-32 h-32'}`}>
        <Image src={currentUrl} alt="" fill className="object-cover" />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <label className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-colors ${wide ? 'aspect-[3/1]' : 'w-32 h-32'}`}>
      {isUploading ? (
        <Loader size={22} className="text-violet-400 animate-spin" />
      ) : (
        <>
          <Upload size={22} className="text-slate-500 mb-1" />
          <span className="text-xs text-slate-500 text-center px-2">{label}</span>
        </>
      )}
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />
    </label>
  );
}
