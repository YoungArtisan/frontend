import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

export const placeOrder = async (orderData) => {
    try {
        const order = {
            ...orderData,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'orders'), order);
        return { id: docRef.id, ...order };
    } catch (error) {
        console.error('Error placing order:', error);
        throw error;
    }
};

export const getOrdersByUserId = async (userId) => {
    try {
        const q = query(
            collection(db, 'orders'),
            where('customerId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
};
