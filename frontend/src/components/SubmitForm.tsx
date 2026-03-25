'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProblem, uploadImage } from '@/lib/api';
import { getTelegramWebApp } from '@/lib/telegram';
import LoadingSpinner from './LoadingSpinner';

export default function SubmitForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Sarlavha va tavsif to'ldirilishi shart");
      return;
    }

    setLoading(true);
    setError('');

    try {
      let imageUrl: string | undefined;
      if (image) {
        const uploadResult = await uploadImage(image);
        imageUrl = uploadResult.url;
      }

      await createProblem({
        title: title.trim(),
        description: description.trim(),
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
        image_url: imageUrl,
      });

      const webapp = getTelegramWebApp();
      webapp?.HapticFeedback.notificationOccurred('success');

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
      const webapp = getTelegramWebApp();
      webapp?.HapticFeedback.notificationOccurred('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-tg-text mb-1">
          Sarlavha *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Muammoni qisqacha yozing"
          maxLength={300}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-tg-text placeholder-tg-hint text-sm focus:outline-none focus:border-tg-button focus:ring-1 focus:ring-tg-button"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-tg-text mb-1">
          Tavsif *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Muammoni batafsil tavsiflang..."
          rows={4}
          maxLength={5000}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-tg-text placeholder-tg-hint text-sm focus:outline-none focus:border-tg-button focus:ring-1 focus:ring-tg-button resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-tg-text mb-1">
            Kenglik (lat)
          </label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="41.2995"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-tg-text placeholder-tg-hint text-sm focus:outline-none focus:border-tg-button focus:ring-1 focus:ring-tg-button"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-tg-text mb-1">
            Uzunlik (lng)
          </label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="69.2401"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-tg-text placeholder-tg-hint text-sm focus:outline-none focus:border-tg-button focus:ring-1 focus:ring-tg-button"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-tg-text mb-1">
          Rasm (ixtiyoriy)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="w-full text-sm text-tg-hint file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-tg-secondary file:text-tg-text hover:file:bg-gray-200"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-tg-button text-tg-button-text rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            AI tahlil qilmoqda...
          </>
        ) : (
          'Muammoni yuborish'
        )}
      </button>

      <p className="text-xs text-tg-hint text-center">
        AI avtomatik ravishda kategoriya, sentiment va dolzarblikni aniqlaydi
      </p>
    </form>
  );
}
