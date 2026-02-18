import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, writeBatch, doc, onSnapshot, updateDoc } from 'firebase/firestore';
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

/**
 * Fetch all orders that contain at least one item from this artist.
 *
 * Strategy:
 *  1. Primary: query by `artistIds` array-contains (fast, secure — for new orders).
 *  2. Fallback: query by `customerId` is NOT possible for artists. Instead we
 *     also read orders where `items[].artistId` matches — but Firestore can't
 *     query nested array maps. So for old orders (without `artistIds`), we rely
 *     on the Firestore rule allowing artists to read orders containing their UID.
 *
 * The `artistIds` field is written at checkout for all new orders.
 * Old orders without `artistIds` are backfilled by `migrateArtistIds()`.
 */
export const getOrdersByArtistId = async (artistId) => {
    try {
        const q = query(
            collection(db, 'orders'),
            where('artistIds', 'array-contains', artistId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching artist orders:', error);
        return [];
    }
};

/**
 * Real-time subscription to artist orders.
 */
export const subscribeToArtistOrders = (artistId, callback) => {
    const q = query(
        collection(db, 'orders'),
        where('artistIds', 'array-contains', artistId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(orders);
    }, (error) => {
        console.error('Error subscribing to artist orders:', error);
        callback([]); // Return empty on error
    });
};

export const updateOrderStatus = async (orderId, status) => {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

/**
 * One-time migration: backfill `artistIds` on existing orders that don't have it.
 * Call this once from the admin or artist dashboard. Safe to run multiple times.
 */
export const migrateArtistIds = async () => {
    try {
        // Fetch all orders that are missing the artistIds field
        const allOrdersSnap = await getDocs(collection(db, 'orders'));
        const batch = writeBatch(db);
        let count = 0;

        allOrdersSnap.docs.forEach(orderDoc => {
            const data = orderDoc.data();
            // Only migrate orders that don't have artistIds yet
            if (!data.artistIds) {
                const artistIds = [
                    ...new Set(
                        (data.items || [])
                            .map(item => item.artistId)
                            .filter(id => id && typeof id === 'string' && id.length > 10) // filter out name strings
                    )
                ];
                if (artistIds.length > 0) {
                    batch.update(doc(db, 'orders', orderDoc.id), { artistIds });
                    count++;
                }
            }
        });

        if (count > 0) {
            await batch.commit();
            console.log(`Migrated ${count} orders with artistIds`);
        }
        return count;
    } catch (error) {
        // Fail silently or just log warning - don't crash the app if permissions are missing
        console.warn('Migration skipped/failed (likely due to permission rules):', error.message);
        return 0;
    }
};

export const getArtistStats = async (artistId, artistName) => {
    try {
        const orders = await getOrdersByArtistId(artistId);

        let totalSales = 0;
        let activeOrders = 0;

        orders.forEach(order => {
            // Sum only this artist's items
            const artistItems = order.items?.filter(
                item => item.artistId === artistId || item.artistName === artistName
            ) || [];

            artistItems.forEach(item => {
                const price = parseFloat(String(item.price).replace('$', '')) || 0;
                totalSales += price * (item.quantity || 1);
            });

            if (order.status === 'pending') {
                activeOrders++;
            }
        });

        return {
            totalOrders: orders.length,
            totalSales: totalSales.toFixed(2),
            activeOrders,
            orders
        };
    } catch (error) {
        console.error('Error fetching artist stats:', error);
        return { totalOrders: 0, totalSales: '0.00', activeOrders: 0, orders: [] };
    }
};
