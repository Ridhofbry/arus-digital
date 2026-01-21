// src/hooks/usePortfolio.js
import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';

/**
 * Custom hook for portfolio management
 * @param {Object} db - Firestore database instance
 * @param {string} appId - Application ID
 * @param {Object} user - Current user object
 */
export const usePortfolio = (db, appId, user) => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch portfolio items
  useEffect(() => {
    if (!user || !db) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'portfolio_arus_digital_v2')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Sort by creation date (newest first)
          items.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });
          
          setPortfolioItems(items);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Portfolio fetch error:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Portfolio setup error:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [user, db, appId]);

  // Add new portfolio item
  const addPortfolioItem = async (itemData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const docRef = await addDoc(
        collection(db, 'artifacts', appId, 'public', 'data', 'portfolio_arus_digital_v2'),
        {
          ...itemData,
          createdAt: serverTimestamp(),
          authorId: user.uid,
          views: itemData.views || '0'
        }
      );
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error('Add portfolio error:', err);
      throw err;
    }
  };

  // Delete portfolio item
  const deletePortfolioItem = async (itemId) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await deleteDoc(
        doc(db, 'artifacts', appId, 'public', 'data', 'portfolio_arus_digital_v2', itemId)
      );
      return { success: true };
    } catch (err) {
      console.error('Delete portfolio error:', err);
      throw err;
    }
  };

  // Filter portfolio by category
  const filterByCategory = (category) => {
    if (!category || category === 'All') return portfolioItems;
    return portfolioItems.filter(item => item.category === category);
  };

  // Search portfolio
  const searchPortfolio = (searchTerm) => {
    if (!searchTerm) return portfolioItems;
    const term = searchTerm.toLowerCase();
    return portfolioItems.filter(item =>
      item.title?.toLowerCase().includes(term) ||
      item.category?.toLowerCase().includes(term)
    );
  };

  return {
    portfolioItems,
    loading,
    error,
    addPortfolioItem,
    deletePortfolioItem,
    filterByCategory,
    searchPortfolio
  };
};
