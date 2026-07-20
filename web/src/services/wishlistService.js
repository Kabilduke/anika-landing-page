import { supabase } from '../lib/supabase';

export const wishlistService = {
  /**
   * Retrieves all wishlist items for a user.
   * @param {string} userId
   * @returns {Promise<any[]>}
   */
  async getWishlistItems(userId) {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*, products(*, categories(name))')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(item => {
      const rawPrice = Number(item.products.price) || 0;
      const rawDiscount = Number(item.products.discount_price) || 0;
      const finalPrice = rawDiscount > 0 ? rawPrice - rawDiscount : rawPrice;

      return {
        id: item.products.product_id,
        dbId: item.id,
        name: item.products.name,
        price: finalPrice,
        originalPrice: Number(item.products.compare_price || Math.round(rawPrice * 1.3)),
        category: item.products.categories?.name || '',
        qty: 1,
        image: item.products.images && item.products.images[0] ? item.products.images[0] : '/src/assets/cart/bangle1.webp',
        deliveryDate: '2 - 3 Days'
      };
    });
  },


  /**
   * Adds a single product to user's wishlist.
   * @param {string} userId
   * @param {number} productId
   */
  async addWishlistItem(userId, productId) {
    const { data, error } = await supabase
      .from('wishlist_items')
      .upsert({
        user_id: userId,
        product_id: productId
      }, { onConflict: 'user_id,product_id' })
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Deletes a wishlist item by user_id and product_id.
   * @param {string} userId
   * @param {number} productId
   */
  async deleteWishlistItem(userId, productId) {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
  },

  /**
   * Deletes multiple wishlist items by DB IDs.
   * @param {string[]} dbIds
   */
  async deleteWishlistItems(dbIds) {
    if (!dbIds || dbIds.length === 0) return;
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .in('id', dbIds);

    if (error) throw error;
  },

  /**
   * Synchronizes multiple wishlist items to DB (upsert).
   * @param {any[]} items
   */
  async syncWishlistItems(items) {
    if (!items || items.length === 0) return;
    const { data, error } = await supabase
      .from('wishlist_items')
      .upsert(items, { onConflict: 'user_id,product_id' })
      .select();

    if (error) throw error;
    return data;
  }
};
