import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProductsByArtist, addProduct } from '../../services/ProductService';

const ArtistProductsPage = () => {
    const { currentUser } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        title: '',
        price: '',
        description: '',
        category: 'Accessories',
        image: 'https://placehold.co/600x600?text=New+Product' // Placeholder for image upload
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

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            console.log('Adding product with data:', {
                ...newProduct,
                artist: {
                    uid: currentUser.uid,
                    name: currentUser.displayName
                }
            });

            const productData = {
                ...newProduct,
                price: `$${newProduct.price}`, // Standardize price format
                artist: {
                    uid: currentUser.uid,
                    name: currentUser.displayName,
                    avatar: 'https://placehold.co/100x100?text=Artist' // Placeholder
                }
            };

            await addProduct(productData);
            setShowAddModal(false);
            setNewProduct({
                title: '',
                price: '',
                description: '',
                category: 'Accessories',
                image: 'https://placehold.co/600x600?text=New+Product'
            });
            fetchArtistProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            // Show more detailed error message
            const errorMessage = error.message || 'Unknown error occurred';
            alert(`Failed to add product: ${errorMessage}\n\nCheck the console for more details.`);
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
                                    <button className="flex-1 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                                        <i className="fa-solid fa-pen-to-square"></i> Edit
                                    </button>
                                    <button className="p-2 text-red-500 border border-red-100 rounded-lg hover:bg-red-50">
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
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 text-sm font-bold border border-gray-200 rounded-xl hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 text-sm font-bold bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90"
                                >
                                    List Product
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
