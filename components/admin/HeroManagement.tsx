import React, { useState } from 'react';
import type { HeroContent, Notification } from '../../types';
import { heroAPI } from '../../services/api';
import ConfirmModal from '../ConfirmModal';

const STATIC_URL = import.meta.env.VITE_STATIC_URL || (typeof window !== 'undefined' ? window.location.origin : '');
const imgUrl = (path: string) => path ? `${STATIC_URL}${path}` : '';

interface HeroManagementProps {
    heroContents: HeroContent[];
    setHeroContents: React.Dispatch<React.SetStateAction<HeroContent[]>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    addNotification: (type: Notification['type'], title: string, message: string) => void;
}

const HeroManagement: React.FC<HeroManagementProps> = ({
    heroContents,
    setHeroContents,
    loading,
    setLoading,
    addNotification
}) => {
    const [heroForm, setHeroForm] = useState({
        title: '',
        subtitle: '',
        description: '',
        cta: '',
        backgroundGradient: 'from-green-600 via-green-700 to-blue-800',
        backgroundImage: null as File | null,
        isActive: true,
        order: 1
    });
    const [editingHero, setEditingHero] = useState<string | null>(null);
    const [heroImagePreview, setHeroImagePreview] = useState<string>('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const gradientOptions = [
        { value: 'from-green-600 via-green-700 to-blue-800', name: 'Yeşil-Mavi', preview: 'bg-gradient-to-r from-green-600 via-green-700 to-blue-800' },
        { value: 'from-blue-600 via-purple-600 to-green-600', name: 'Mavi-Mor-Yeşil', preview: 'bg-gradient-to-r from-blue-600 via-purple-600 to-green-600' },
        { value: 'from-green-500 to-blue-600', name: 'Yeşil-Mavi (Basit)', preview: 'bg-gradient-to-r from-green-500 to-blue-600' },
        { value: 'from-emerald-600 to-teal-600', name: 'Zümrüt-Teal', preview: 'bg-gradient-to-r from-emerald-600 to-teal-600' },
        { value: 'from-slate-900 to-slate-700', name: 'Koyu Gri', preview: 'bg-gradient-to-r from-slate-900 to-slate-700' }
    ];

    const handleHeroSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', heroForm.title);
            formData.append('subtitle', heroForm.subtitle);
            formData.append('description', heroForm.description);
            formData.append('cta', heroForm.cta);
            formData.append('background_gradient', heroForm.backgroundGradient);
            formData.append('is_active', heroForm.isActive.toString());
            formData.append('order_index', heroForm.order.toString());

            if (heroForm.backgroundImage) {
                formData.append('background_image', heroForm.backgroundImage);
            }

            if (editingHero) {
                const updatedHero = await heroAPI.update(Number(editingHero), formData);
                setHeroContents(prev => prev.map(h =>
                    h.id === editingHero
                        ? {
                            ...updatedHero,
                            id: updatedHero.id.toString(),
                            backgroundImage: updatedHero.background_image ? imgUrl(updatedHero.background_image) : ''
                        }
                        : h
                ));
                addNotification('success', 'Başarılı!', 'Hero içeriği güncellendi.');
            } else {
                const newHero = await heroAPI.create(formData);
                setHeroContents(prev => [...prev, {
                    ...newHero,
                    id: newHero.id.toString(),
                    backgroundImage: newHero.background_image ? imgUrl(newHero.background_image) : ''
                }]);
                addNotification('success', 'Başarılı!', 'Yeni hero içeriği eklendi.');
            }

            // Reset form
            setHeroForm({
                title: '',
                subtitle: '',
                description: '',
                cta: '',
                backgroundGradient: 'from-green-600 via-green-700 to-blue-800',
                backgroundImage: null,
                isActive: true,
                order: 1
            });
            setEditingHero(null);
            setHeroImagePreview('');
        } catch (error) {
            addNotification('error', 'Hata!', 'Hero içeriği kaydedilirken hata oluştu:');
            addNotification('error', 'Hata!', 'Hero içeriği kaydedilirken hata oluştu.');
        }
        setLoading(false);
    };

    const handleHeroEdit = (hero: HeroContent) => {
        setEditingHero(hero.id);
        setHeroForm({
            title: hero.title,
            subtitle: hero.subtitle,
            description: hero.description,
            cta: hero.cta,
            backgroundGradient: hero.backgroundGradient,
            backgroundImage: null,
            isActive: hero.isActive,
            order: hero.order
        });
        if (hero.backgroundImage) {
            setHeroImagePreview(hero.backgroundImage);
        }
    };

        const handleHeroDelete = (id: string) => {
        setDeleteConfirm(id);
    };

    const confirmHeroDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await heroAPI.delete(Number(deleteConfirm));
            setHeroContents(prev => prev.filter(h => h.id !== deleteConfirm));
            addNotification('success', 'Başarılı!', 'Hero içeriği silindi.');
        } catch (error) {
            addNotification('error', 'Hata!', 'Hero içeriği silinirken hata oluştu.');
        }
        setDeleteConfirm(null);
    };

    const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setHeroForm({ ...heroForm, backgroundImage: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setHeroImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const activeHeroCount = heroContents.filter(h => h.isActive).length;

    return (
        <>
            <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">🎬 Hero İçeriği Yönetimi</h2>

                {/* Active Hero Count */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                        <span className="text-blue-500 text-lg">🎬</span>
                        <span className="text-sm font-medium text-blue-800">
                            Aktif Hero İçerikleri: {activeHeroCount}
                        </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                        Ana sayfada sırayla gösterilecek hero içerikleri.
                    </p>
                </div>

                {/* Hero Form */}
                <form onSubmit={handleHeroSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Ana Başlık"
                            value={heroForm.title}
                            onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                            className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Alt Başlık"
                            value={heroForm.subtitle}
                            onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                            className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <textarea
                        placeholder="Açıklama Metni"
                        value={heroForm.description}
                        onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Buton Metni (ör: İletişime Geç)"
                            value={heroForm.cta}
                            onChange={(e) => setHeroForm({ ...heroForm, cta: e.target.value })}
                            className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        />
                        <input
                            type="number"
                            min="1"
                            placeholder="Sıra"
                            value={heroForm.order}
                            onChange={(e) => setHeroForm({ ...heroForm, order: parseInt(e.target.value) || 1 })}
                            className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Gradient Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">🎨 Arka Plan Rengi</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {gradientOptions.map((gradient) => (
                                <div
                                    key={gradient.value}
                                    className={`relative cursor-pointer rounded-lg p-3 border-2 transition-all ${heroForm.backgroundGradient === gradient.value
                                            ? 'border-green-500 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => setHeroForm({ ...heroForm, backgroundGradient: gradient.value })}
                                >
                                    <div className={`w-full h-8 rounded ${gradient.preview} mb-2`}></div>
                                    <p className="text-xs text-center text-gray-600">{gradient.name}</p>
                                    {heroForm.backgroundGradient === gradient.value && (
                                        <div className="absolute top-1 right-1 text-green-500">✓</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Background Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">🖼️ Arka Plan Görseli (İsteğe Bağlı)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeroImageChange}
                            className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {heroImagePreview && (
                            <div className="mt-3">
                                <img
                                    src={heroImagePreview}
                                    alt="Preview"
                                    className="w-full max-w-md h-32 object-cover rounded-lg border"
                                />
                            </div>
                        )}
                    </div>

                    {/* Active Switch */}
                    <div className="flex items-center space-x-3">
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={heroForm.isActive}
                                    onChange={(e) => setHeroForm({ ...heroForm, isActive: e.target.checked })}
                                    className="sr-only"
                                />
                                <div className={`w-12 h-6 rounded-full transition-all duration-300 ${heroForm.isActive ? 'bg-green-500' : 'bg-gray-300'
                                    }`}>
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${heroForm.isActive ? 'translate-x-6' : 'translate-x-0.5'
                                        } mt-0.5`}></div>
                                </div>
                            </div>
                            <span className="ml-3 text-sm font-medium text-gray-700">
                                Aktif (Ana sayfada göster)
                            </span>
                        </label>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
                        >
                            {loading ? '⏳ Kaydediliyor...' : (editingHero ? '✅ Güncelle' : '➕ Ekle')}
                        </button>
                        {editingHero && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingHero(null);
                                    setHeroForm({
                                        title: '',
                                        subtitle: '',
                                        description: '',
                                        cta: '',
                                        backgroundGradient: 'from-green-600 via-green-700 to-blue-800',
                                        backgroundImage: null,
                                        isActive: true,
                                        order: 1
                                    });
                                    setHeroImagePreview('');
                                }}
                                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-medium transition-colors"
                            >
                                ❌ İptal
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Hero List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Hero İçerikleri ({heroContents.length})
                </h3>

                {heroContents.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🎬</div>
                        <p className="text-gray-500 text-lg">Henüz hero içeriği eklenmemiş.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {heroContents
                            .sort((a, b) => a.order - b.order)
                            .map((hero) => (
                                <div key={hero.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                    {/* Hero Preview */}
                                    <div className={`bg-gradient-to-r ${hero.backgroundGradient} text-white p-6 relative`}>
                                        {hero.backgroundImage && (
                                            <div
                                                className="absolute inset-0 bg-cover bg-center opacity-30"
                                                style={{ backgroundImage: `url(${hero.backgroundImage})` }}
                                            ></div>
                                        )}
                                        <div className="relative z-10">
                                            <h2 className="text-2xl font-bold mb-2">{hero.title}</h2>
                                            <h3 className="text-lg mb-3 opacity-90">{hero.subtitle}</h3>
                                            <p className="mb-4 opacity-80">{hero.description}</p>
                                            <button className="bg-white text-gray-900 px-6 py-2 rounded-lg font-medium">
                                                {hero.cta}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Hero Controls */}
                                    <div className="p-4 bg-gray-50 flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <span className={`px-3 py-1 rounded-full text-sm ${hero.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {hero.isActive ? '✅ Aktif' : '⏸️ Pasif'}
                                            </span>
                                            <span className="text-sm text-gray-600">Sıra: {hero.order}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleHeroEdit(hero)}
                                                className="text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-sm transition-colors"
                                            >
                                                ✏️ Düzenle
                                            </button>
                                            <button
                                                onClick={() => handleHeroDelete(hero.id)}
                                                className="text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-sm transition-colors"
                                            >
                                                🗑️ Sil
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
            </div>
            <ConfirmModal
                isOpen={deleteConfirm !== null}
                title="Silme Onayı"
                message="Bu hero içeriğini silmek istediğinizden emin misiniz?"
                onConfirm={confirmHeroDelete}
                onCancel={() => setDeleteConfirm(null)}
            />
        </>
    );
};

export default HeroManagement;
