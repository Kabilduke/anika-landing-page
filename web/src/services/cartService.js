import { supabase } from '../lib/supabase';

export const cartService = {
  /**
   * Retrieves all cart items for a user.
   * @param {string} userId
   * @returns {Promise<any[]>}
   */
  async getCartItems(userId) {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*, categories(name))')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id, // DB primary key
      productId: item.product_id,
      name: item.products.name,
      price: Number(item.products.price),
      originalPrice: Number(item.products.compare_price || Math.round(item.products.price * 1.3)),
      category: item.products.categories?.name || '',
      qty: item.qty,
      size: item.size,
      image: item.products.images && item.products.images[0] ? item.products.images[0] : '/src/assets/cart/bangle1.webp',
      deliveryDate: 'Sep 12, 2025' // mock matching storefront expectation
    }));
  },

  /**
   * Adds a single item to user's cart.
   * @param {string} userId
   * @param {number} productId
   * @param {number} qty
   * @param {string|null} size
   */
  async addCartItem(userId, productId, qty = 1, size = null) {
    const { data, error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: userId,
        product_id: productId,
        qty,
        size
      }, { onConflict: 'user_id,product_id,size' })
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Updates quantity of a cart item.
   * @param {string} itemId
   * @param {number} qty
   */
  async updateCartItemQty(itemId, qty) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ qty })
      .eq('id', itemId)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Deletes specific cart items by their primary key IDs.
   * @param {string[]} itemIds
   */
  async deleteCartItems(itemIds) {
    if (!itemIds || itemIds.length === 0) return;
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .in('id', itemIds);

    if (error) throw error;
  },

  /**
   * Synchronizes multiple cart items to DB (upsert).
   * @param {any[]} items
   */
  async syncCartItems(items) {
    if (!items || items.length === 0) return;
    const { data, error } = await supabase
      .from('cart_items')
      .upsert(items, { onConflict: 'user_id,product_id,size' })
      .select();

    if (error) throw error;
    return data;
  }
};
