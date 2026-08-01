import React, { useState } from 'react';
import type { Product, Notification } from '../../types';
import { productsAPI } from '../../services/api';
import ConfirmModal from '../ConfirmModal';

const STATIC_URL = import.meta.env.VITE_STATIC_URL || (typeof window !== 'undefined' ? window.location.origin : '');
const imgUrl = (path: string) => path ? `${STATIC_URL}${path}` : '';

interface ProductManagementProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    addNotification: (type: Notification['type'], title: string, message: string) => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({
    products,
    setProducts,
    loading,
    setLoading,
    addNotification
}) => {
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        category: '',
        isFeatured: false
    });
    const [productImages, setProductImages] = useState<File[]>([]);
    const [deletedImages, setDeletedImages] = useState<string[]>([]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Öne çıkan ürün kontrolü - yeni ekleme durumunda
        if (!currentProduct && productForm.isFeatured) {
            const featuredCount = products.filter(p => p.isFeatured).length;
            if (featuredCount >= 4) {
                addNotification('warning', 'Uyarı!', 'Maksimum 4 ürün öne çıkarılabilir. Önce başka bir ürünü öne çıkan listesinden çıkarın.');
                return;
            }
        }

        // Öne çıkan ürün kontrolü - düzenleme durumunda
        if (currentProduct && productForm.isFeatured && !currentProduct.isFeatured) {
            const featuredCount = products.filter(p => p.isFeatured && p.id !== currentProduct.id).length;
            if (featuredCount >= 4) {
                addNotification('warning', 'Uyarı!', 'Maksimum 4 ürün öne çıkarılabilir. Önce başka bir ürünü öne çıkan listesinden çıkarın.');
                return;
            }
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', productForm.name);
            formData.append('description', productForm.description);
            formData.append('category', productForm.category);
            formData.append('is_featured', productForm.isFeatured.toString());

            // Çoklu resim ekleme
            productImages.forEach((file) => {
                formData.append('images', file);
            });

            // Silinen görselleri bildir
            if (deletedImages.length > 0) {
                formData.append('deletedImages', JSON.stringify(deletedImages));
            }

            // Yeni resim yoksa mevcutları koru
            if (productImages.length === 0 && getCurrentImages().length > 0) {
                formData.append('keepExistingImages', 'true');
            }

            if (currentProduct) {
                const updatedProduct = await productsAPI.update(Number(currentProduct.id), formData);
                setProducts(prev => prev.map(p =>
                    p.id === currentProduct.id
                        ? {
                            ...updatedProduct,
                            id: updatedProduct.id.toString(),
                            imageUrl: updatedProduct.image_url ? imgUrl(updatedProduct.image_url) : '/placeholder.svg',
                            images: (updatedProduct.images || []).map((i: string) => imgUrl(i))
                        }
                        : p
                ));
                addNotification('success', 'Başarılı!', 'Ürün güncellendi.');
            } else {
                const newProduct = await productsAPI.create(formData);
                setProducts(prev => [...prev, {
                    ...newProduct,
                    id: newProduct.id.toString(),
                    imageUrl: newProduct.image_url ? imgUrl(newProduct.image_url) : '/placeholder.svg',
                    images: (newProduct.images || []).map((i: string) => imgUrl(i))
                }]);
                addNotification('success', 'Başarılı!', 'Yeni ürün eklendi.');
            }

            closeProductModal();
        } catch (error) {
            addNotification('error', 'Hata!', 'Ürün kaydedilirken hata oluştu:');
            addNotification('error', 'Hata!', 'Ürün kaydedilirken hata oluştu.');
        }
        setLoading(false);
    };

    const handleProductEdit = (product: Product) => {
        setCurrentProduct(product);
        setProductForm({
            name: product.name,
            description: product.description,
            category: product.category,
            isFeatured: product.isFeatured || false
        });
        setProductImages([]);
        setIsProductModalOpen(true);
    };

    const getCurrentImages = (): string[] => {
        if (currentProduct?.images && currentProduct.images.length > 0) return currentProduct.images.filter(i => !deletedImages.includes(i));
        if (currentProduct?.imageUrl && !deletedImages.includes(currentProduct.imageUrl)) return [currentProduct.imageUrl];
        return [];
    };

    const closeProductModal = () => {
        setCurrentProduct(null);
        setProductForm({ name: '', description: '', category: '', isFeatured: false });
        setProductImages([]);
        setDeletedImages([]);
        setIsProductModalOpen(false);
    };

        const handleProductDelete = (id: string) => {
        setDeleteConfirm(id);
    };

    const confirmProductDelete = async () => {
        if (!deleteConfirm) return;
        try {
                    await productsAPI.delete(Number(id));
                    setProducts(prev => prev.filter(p => p.id !== id));
                    addNotification('success', 'Başarılı!', 'Ürün silindi.');
                } catch (error) {
                    addNotification('error', 'Hata!', 'Ürün silinirken hata oluştu:');
                    addNotification('error', 'Hata!', 'Ürün silinirken hata oluştu.');
                }
            
        setDeleteConfirm(null);
    };;

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">📦 Ürün Yönetimi</h2>
                        <button
                            onClick={() => setIsProductModalOpen(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors"
                        >
                            ➕ Yeni Ürün Ekle
                        </button>
                    </div>

                    {/* Featured Products Count */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center space-x-2">
                            <span className="text-amber-500 text-lg">⭐</span>
                            <span className="text-sm font-medium text-amber-800">
                                Öne Çıkan Ürünler: {products.filter(p => p.isFeatured).length}/4
                            </span>
                        </div>
                        <p className="text-xs text-amber-600 mt-1">
                            Maksimum 4 ürün öne çıkarılabilir ve ana sayfada gösterilir.
                        </p>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Ürünler ({products.length})
                    </h3>

                    {products.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📦</div>
                            <p className="text-gray-500 text-lg">Henüz ürün eklenmemiş.</p>
                            <button
                                onClick={() => setIsProductModalOpen(true)}
                                className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
                            >
                                ➕ İlk Ürünü Ekle
                            </button>
                        </div>
                    ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                                    {/* Product Image */}
                                    <div className="relative h-48">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {product.isFeatured && (
                                            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                                                <span>⭐</span>
                                                <span>Öne Çıkan</span>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 flex space-x-1">
                                            <button
                                                onClick={() => handleProductEdit(product)}
                                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                                                title="Düzenle"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleProductDelete(product.id)}
                                                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                                                title="Sil"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h4>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                {product.category}
                                            </span>
                                            {product.images && product.images.length > 1 && (
                                                <span className="text-xs text-gray-500">
                                                    📷 {product.images.length} görsel
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">
                                {currentProduct ? '✏️ Ürün Düzenle' : '➕ Yeni Ürün Ekle'}
                            </h3>
                            <button
                                onClick={closeProductModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleProductSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Ürün Adı"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Kategori"
                                    value={productForm.category}
                                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <textarea
                                placeholder="Ürün Açıklaması"
                                value={productForm.description}
                                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                className="border border-gray-300 rounded-lg px-4 py-3 h-24 w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">📷 Ürün Görselleri (Çoklu Seçim)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setProductImages(files);
                                    }}
                                    className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            {/* New Images Preview */}
                            {productImages.length > 0 && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">🆕 Yeni Seçilen Görseller:</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {productImages.map((file, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Yeni görsel ${index + 1}`}
                                                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setProductImages(productImages.filter((_, i) => i !== index))}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Öne Çıkan Ürün Switch */}
                            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setProductForm({ ...productForm, isFeatured: !productForm.isFeatured })}>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={productForm.isFeatured}
                                        onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                                        className="sr-only"
                                    />
                                    <div className={`w-12 h-6 rounded-full transition-all duration-300 ${productForm.isFeatured ? 'bg-amber-500' : 'bg-gray-300'}`}>
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${productForm.isFeatured ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-amber-500 text-lg">⭐</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        Öne Çıkan Ürün (Ana sayfada göster)
                                    </span>
                                </div>
                            </div>

                            {/* Current Images Preview */}
                            {currentProduct && ((currentProduct.images && currentProduct.images.length > 0) || currentProduct.imageUrl) && productImages.length === 0 && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Görseller:</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {getCurrentImages().map((image, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={image}
                                                    alt={`${currentProduct.name} ${index + 1}`}
                                                    className={`w-full h-20 object-cover rounded-lg border ${index === 0 ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-200'}`}
                                                />
                                                {index === 0 && (
                                                    <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                                        Ana
                                                    </div>
                                                )}
                                                {/* Butonlar */}
                                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {index > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Ana görsel yap: bu index'i 0'a taşı
                                                                const imgs = [...getCurrentImages()];
                                                                const moved = imgs.splice(index, 1)[0];
                                                                imgs.unshift(moved);
                                                                // State'i güncelle
                                                                setDeletedImages(d => [...d, ...currentProduct.images!.filter(i => !imgs.includes(i))]);
                                                            }}
                                                            className="bg-yellow-500 text-white p-1.5 rounded-full hover:bg-yellow-600 transition-colors"
                                                            title="Ana Görsel Yap"
                                                        >
                                                            ⭐
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeletedImages(d => [...d, image]);
                                                        }}
                                                        className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                                                        title="Görseli Sil"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {deletedImages.length > 0 && (
                                        <p className="text-xs text-amber-600 mt-2">
                                            {deletedImages.length} görsel silinecek. Kaydet'e tıklayarak kalıcı hale getirin.
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors flex-1"
                                >
                                    {loading ? '⏳ Kaydediliyor...' : (currentProduct ? '✅ Güncelle' : '➕ Ekle')}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeProductModal}
                                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-medium transition-colors"
                                >
                                    ❌ İptal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmModal
                isOpen={deleteConfirm !== null}
                title="Silme Onayı"
                message="Bu ürünü silmek istediğinizden emin misiniz?"
                onConfirm={confirmProductDelete}
                onCancel={() => setDeleteConfirm(null)}
            />
        </>
    );
};

export default ProductManagement;

