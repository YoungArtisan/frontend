import { collection, getDocs, doc, getDoc, query, where, addDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const getProducts = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

export const getProductById = async (productId) => {
    try {
        // Try to find by custom numeric id field from seeding
        const q = query(collection(db, 'products'), where('id', '==', parseInt(productId)));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const productDoc = querySnapshot.docs[0];
            return { id: productDoc.id, ...productDoc.data() };
        }

        // Fallback to Firestore auto-id if not found by numeric id
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }

        return null;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
};

export const addProduct = async (productData) => {
    try {
        const docRef = await addDoc(collection(db, 'products'), {
            ...productData,
            createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...productData };
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
};

export const getProductsByArtist = async (artistUid) => {
    try {
        // Query products where artist.uid matches (we need to make sure our data structure supports this)
        const q = query(
            collection(db, 'products'),
            where('artist.uid', '==', artistUid)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching artist products:', error);
        return [];
    }
};

export const updateProduct = async (productId, productData) => {
    try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, {
            ...productData,
            updatedAt: serverTimestamp()
        });
        return { id: productId, ...productData };
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

export const deleteProduct = async (productId) => {
    try {
        const productRef = doc(db, 'products', productId);
        await deleteDoc(productRef);
        return productId;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
};
