import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProductsByArtist, addProduct, updateProduct, deleteProduct } from '../../services/ProductService';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase/config';

const ArtistProductsPage = () => {
    const { currentUser } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [newProduct, setNewProduct] = useState({
        title: '',
        price: '',
        description: '',
        category: 'Accessories',
        images: []
    });

    useEffect(() => {
        if (currentUser) {
            fetchArtistProducts();
        }
    }, [currentUser]);

    const fetchArtistProducts = async () => {
        try {
            setLoading(true);
            const data = await getProductsByArtist(currentUser.uid);
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        // Limit to 5 images total
        const currentCount = imagePreviews.length;
        const availableSlots = 5 - currentCount;

        if (files.length > availableSlots) {
            alert(`You can only upload ${availableSlots} more image(s). Maximum 5 images per product.`);
            return;
        }

        // Validate each file
        const validFiles = [];
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image file`);
                continue;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} is larger than 5MB`);
                continue;
            }

            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        // Add to imageFiles array
        setImageFiles(prev => [...prev, ...validFiles]);

        // Create previews
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const deleteImageFromStorage = async (imageUrl) => {
        try {
            // Extract the path from the URL
            const decodedUrl = decodeURIComponent(imageUrl);
            const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);

            if (pathMatch && pathMatch[1]) {
                const imagePath = pathMatch[1];
                const imageRef = ref(storage, imagePath);
                await deleteObject(imageRef);
                console.log('Image deleted from storage:', imagePath);
            }
        } catch (error) {
            console.error('Error deleting image from storage:', error);
        }
    };

    const uploadImage = async (file) => {
        return new Promise((resolve, reject) => {
            // Sanitize filename - remove spaces and special characters
            const sanitizedName = file.name
                .replace(/\s+/g, '_')  // Replace spaces with underscores
                .replace(/[^a-zA-Z0-9._-]/g, '');  // Remove special characters

            const fileName = `products/${currentUser.uid}/${Date.now()}_${sanitizedName}`;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                    console.log('Upload progress:', progress + '%');
                },
                (error) => {
                    console.error('Upload error:', error);
                    reject(error);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        console.log('Download URL obtained:', downloadURL);
                        resolve(downloadURL);
                    } catch (error) {
                        console.error('Error getting download URL:', error);
                        reject(error);
                    }
                }
            );
        });
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();

        if (imageFiles.length === 0) {
            alert('Please select at least one product image');
            return;
        }

        try {
            setUploading(true);
            console.log('Uploading images...');

            // Upload all images
            const imageUrls = [];
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                console.log(`Uploading image ${i + 1}/${imageFiles.length}...`);
                const url = await uploadImage(file);
                imageUrls.push(url);
                setUploadProgress(((i + 1) / imageFiles.length) * 100);
            }

            console.log('All images uploaded:', imageUrls);

            const productData = {
                ...newProduct,
                price: `$${newProduct.price}`,
                images: imageUrls,
                image: imageUrls[0], // Keep first image as main for backward compatibility
                artist: {
                    uid: currentUser.uid,
                    name: currentUser.displayName,
                    avatar: 'https://placehold.co/100x100?text=Artist'
                }
            };

            await addProduct(productData);

            // Reset form
            setShowAddModal(false);
            setNewProduct({
                title: '',
                price: '',
                description: '',
                category: 'Accessories',
                images: []
            });
            setImageFiles([]);
            setImagePreviews([]);
            setUploadProgress(0);

            fetchArtistProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            const errorMessage = error.message || 'Unknown error occurred';
            alert(`Failed to add product: ${errorMessage}`);
        } finally {
            setUploading(false);
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setNewProduct({
            title: product.title,
            price: product.price.replace('$', ''),
            description: product.description,
            category: product.category || 'Accessories',
            images: product.images || [product.image] // Support both old and new format
        });
        setImagePreviews(product.images || [product.image]);
        setImageFiles([]);
        setShowEditModal(true);
    };

    const removeExistingImage = async (index) => {
        const imageUrl = imagePreviews[index];

        // Delete from Firebase Storage
        await deleteImageFromStorage(imageUrl);

        // Remove from previews
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();

        if (imagePreviews.length === 0 && imageFiles.length === 0) {
            alert('Please select at least one product image');
            return;
        }

        try {
            setUploading(true);

            // Upload new images if any
            const newImageUrls = [];
            if (imageFiles.length > 0) {
                for (let i = 0; i < imageFiles.length; i++) {
                    const file = imageFiles[i];
                    const url = await uploadImage(file);
                    newImageUrls.push(url);
                    setUploadProgress(((i + 1) / imageFiles.length) * 100);
                }
            }

            // Combine existing images (from previews that are URLs) with new uploads
            const existingImages = imagePreviews.filter(preview => preview.startsWith('http'));
            const allImages = [...existingImages, ...newImageUrls];

            const productData = {
                title: newProduct.title,
                price: `$${newProduct.price}`,
                description: newProduct.description,
                category: newProduct.category,
                images: allImages,
                image: allImages[0] // Keep first as main
            };

            await updateProduct(editingProduct.id, productData);

            // Reset form
            setShowEditModal(false);
            setEditingProduct(null);
            setNewProduct({
                title: '',
                price: '',
                description: '',
                category: 'Accessories',
                images: []
            });
            setImageFiles([]);
            setImagePreviews([]);
            setUploadProgress(0);

            fetchArtistProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            alert(`Failed to update product: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteProduct = async (productId, productTitle, productImages) => {
        if (window.confirm(`Are you sure you want to delete "${productTitle}"? This action cannot be undone.`)) {
            try {
                // Delete all images from storage first
                if (productImages && productImages.length > 0) {
                    for (const imageUrl of productImages) {
                        await deleteImageFromStorage(imageUrl);
                    }
                }

                // Then delete the product from Firestore
                await deleteProduct(productId);
                fetchArtistProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                alert(`Failed to delete product: ${error.message}`);
            }
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Products</h1>
                    <p className="text-gray-600">Manage your shop listings</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <i className="fa-solid fa-plus"></i> Add New Product
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <img src={product.image} alt={product.title} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-1 truncate">{product.title}</h3>
                                <p className="text-brand-primary font-bold mb-3">{product.price}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditProduct(product)}
                                        className="flex-1 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id, product.title, product.images || [product.image])}
                                        className="p-2 text-red-500 border border-red-100 rounded-lg hover:bg-red-50"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                            <i className="fa-solid fa-box-open text-4xl text-gray-300 mb-3 block"></i>
                            <p className="text-gray-500">You haven't listed any products yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-fade-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Add New Product</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="fa-solid fa-xmark text-xl"></i>
                            </button>
                        </div>
                        <form onSubmit={handleAddProduct} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Product Images * (Max 5)</label>
                                <div className="space-y-3">
                                    {/* Image Thumbnails Grid */}
                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-5 gap-2">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <i className="fa-solid fa-xmark text-xs"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Upload Area */}
                                    {imagePreviews.length < 5 && (
                                        <label className="border-2 border-dashed border-gray-200 rounded-lg p-4 cursor-pointer hover:border-brand-primary transition-colors block text-center">
                                            <i className="fa-solid fa-cloud-arrow-up text-3xl text-gray-300 mb-2 block"></i>
                                            <p className="text-sm text-gray-500">Click to upload images ({imagePreviews.length}/5)</p>
                                            <p className="text-xs text-gray-400 mt-1">Max 5MB per image (JPG, PNG)</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Product Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newProduct.title}
                                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary"
                                    placeholder="e.g. Handmade Ceramic Mug"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-gray-700">Price ($) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary"
                                        placeholder="25.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-gray-700">Category</label>
                                    <select
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary"
                                    >
                                        <option value="Accessories">Accessories</option>
                                        <option value="Home Decor">Home Decor</option>
                                        <option value="Toys">Toys</option>
                                        <option value="Art">Art</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Description *</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary resize-none"
                                    placeholder="Tell customers about your creation..."
                                ></textarea>
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowAddModal(false); setImageFiles([]); setImagePreviews([]); }}
                                    className="flex-1 py-3 text-sm font-bold border border-gray-200 rounded-xl hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 py-3 text-sm font-bold bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                            Uploading... {Math.round(uploadProgress)}%
                                        </span>
                                    ) : 'List Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-fade-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Edit Product</h2>
                            <button onClick={() => { setShowEditModal(false); setEditingProduct(null); setImageFiles([]); setImagePreviews([]); }} className="text-gray-400 hover:text-gray-600">
                                <i className="fa-solid fa-xmark text-xl"></i>
                            </button>
                        </div>
                        <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Product Images (Max 5)</label>
                                <div className="space-y-3">
                                    {/* Image Thumbnails Grid */}
                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-5 gap-2">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={preview}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => preview.startsWith('http') ? removeExistingImage(index) : removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <i className="fa-solid fa-xmark text-xs"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Upload Area */}
                                    {imagePreviews.length < 5 && (
                                        <label className="border-2 border-dashed border-gray-200 rounded-lg p-4 cursor-pointer hover:border-brand-primary transition-colors block text-center">
                                            <i className="fa-solid fa-cloud-arrow-up text-3xl text-gray-300 mb-2 block"></i>
                                            <p className="text-sm text-gray-500">Click to add more images ({imagePreviews.length}/5)</p>
                                            <p className="text-xs text-gray-400 mt-1">Max 5MB per image (JPG, PNG)</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Product Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newProduct.title}
                                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-gray-700">Price ($) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-gray-700">Category</label>
                                    <select
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary"
                                    >
                                        <option value="Accessories">Accessories</option>
                                        <option value="Home Decor">Home Decor</option>
                                        <option value="Toys">Toys</option>
                                        <option value="Art">Art</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Description *</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary resize-none"
                                ></textarea>
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); setEditingProduct(null); setImageFiles([]); setImagePreviews([]); }}
                                    className="flex-1 py-3 text-sm font-bold border border-gray-200 rounded-xl hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 py-3 text-sm font-bold bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                            Updating... {Math.round(uploadProgress)}%
                                        </span>
                                    ) : 'Update Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArtistProductsPage;
