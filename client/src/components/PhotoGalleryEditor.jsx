import React, { useRef, useState } from 'react';
import { X, Star, ChevronLeft, ChevronRight, ImagePlus, Link2 } from 'lucide-react';

export const MAX_PHOTOS = 8;

// Shrink large phone photos before upload (keeps requests under the hosting size limit)
export async function compressImage(file, maxSide = 1600, quality = 0.85) {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

/**
 * Edit a product's photo gallery.
 * photos: [{ id, url, file? }]  (url is a preview/object URL for new files)
 * The first photo is the cover shown in the shop.
 */
export default function PhotoGalleryEditor({ photos, onChange }) {
  const inputRef = useRef(null);
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const room = MAX_PHOTOS - photos.length;

  const addFiles = async fileList => {
    const files = [...fileList].filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    setNote(files.length > room ? `Only ${room} more photo${room === 1 ? '' : 's'} can be added (max ${MAX_PHOTOS}).` : '');
    setBusy(true);
    const prepared = await Promise.all(files.slice(0, room).map(compressImage));
    onChange([
      ...photos,
      ...prepared.map((file, i) => ({ id: `new-${Date.now()}-${i}`, url: URL.createObjectURL(file), file }))
    ]);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const addLink = () => {
    const url = link.trim();
    if (!url) return;
    if (!/^https:\/\//.test(url) && !url.startsWith('/assets/')) {
      setNote('Links must start with https:// (or /assets/ for photos already on the site).');
      return;
    }
    if (room <= 0) return;
    onChange([...photos, { id: `url-${Date.now()}`, url }]);
    setLink('');
    setNote('');
  };

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= photos.length) return;
    const next = [...photos];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const makeCover = i => onChange([photos[i], ...photos.filter((_, k) => k !== i)]);
  const remove = i => onChange(photos.filter((_, k) => k !== i));

  return (
    <div className="sm:col-span-2 p-4 bg-stone-50 rounded-xl border border-stone-200">
      <div className="flex items-baseline justify-between gap-3">
        <label className="block text-xs font-bold text-stone-800">
          Photos <span className="font-normal text-stone-500">({photos.length}/{MAX_PHOTOS} · first photo is the cover)</span>
        </label>
      </div>

      {photos.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {photos.map((ph, i) => (
            <li key={ph.id} className="relative group">
              <div className={`aspect-square rounded-lg overflow-hidden border-2 bg-white ${i === 0 ? 'border-[#c59b27]' : 'border-stone-200'}`}>
                <img src={ph.url} alt="" className="w-full h-full object-cover" />
              </div>
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#1f1d1d] text-[#e6c89c]">COVER</span>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove photo"
                className="absolute right-1.5 top-1.5 w-6 h-6 rounded-full bg-white/95 shadow flex items-center justify-center text-stone-700 hover:text-rose-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="mt-1.5 flex items-center justify-between gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move left"
                  className="p-1 rounded text-stone-500 hover:bg-stone-200 disabled:opacity-30">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {i !== 0 ? (
                  <button type="button" onClick={() => makeCover(i)}
                    className="text-[10px] font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1">
                    <Star className="w-3 h-3" /> Cover
                  </button>
                ) : <span className="text-[10px] text-stone-400">Cover</span>}
                <button type="button" onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label="Move right"
                  className="p-1 rounded text-stone-500 hover:bg-stone-200 disabled:opacity-30">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {room > 0 && (
        <div
          className="mt-3 border-2 border-dashed border-stone-300 rounded-xl p-4 text-center bg-white hover:border-[#c59b27] transition-colors"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        >
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
          <button type="button" onClick={() => inputRef.current && inputRef.current.click()} disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1f1d1d] text-[#e6c89c] text-xs font-semibold hover:bg-stone-800 disabled:opacity-50">
            <ImagePlus className="w-4 h-4" />
            {busy ? 'Preparing photos…' : photos.length ? 'Add more photos' : 'Choose photos'}
          </button>
          <p className="mt-2 text-[11px] text-stone-500">Select several at once, or drag them here. Up to {room} more.</p>
        </div>
      )}

      {room > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <Link2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="…or paste a photo link (https://…)"
            value={link}
            onChange={e => setLink(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#c59b27]"
          />
          <button type="button" onClick={addLink} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-300 hover:bg-stone-100">
            Add link
          </button>
        </div>
      )}
      {note && <p className="mt-2 text-[11px] text-amber-700">{note}</p>}
    </div>
  );
}
