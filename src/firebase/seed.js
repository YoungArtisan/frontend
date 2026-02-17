import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from './config';
import { products } from '../data/products';

export const seedProducts = async () => {
    try {
        // Check if products already exist to avoid duplicates
        const q = query(collection(db, 'products'), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            console.log('Products already seeded.');
            return;
        }

        console.log('Seeding products...');
        for (const product of products) {
            await addDoc(collection(db, 'products'), {
                ...product,
                createdAt: new Date().toISOString()
            });
        }
        console.log('Products seeded successfully!');
    } catch (error) {
        console.error('Error seeding products:', error);
    }
};
