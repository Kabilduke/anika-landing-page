import { supabase } from '../lib/supabase';

/** Strip currency symbols & commas so "₹1,299" → 1299 */
const parsePrice = (v) => {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(/[₹,\s]/g, ''));
  return isNaN(n) ? 0 : n;
};

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

    return (data || []).map(item => {
      const rawPrice = parsePrice(item.products.price);
      const rawDiscount = parsePrice(item.products.discount_price);
      const finalPrice = rawDiscount > 0 ? rawPrice - rawDiscount : rawPrice;

      return {
        id: item.id,
        productId: item.product_id,
        name: item.products.name,
        price: finalPrice,
        originalPrice: parsePrice(item.products.compare_price || Math.round(rawPrice * 1.3)),
        category: item.products.categories?.name || '',
        qty: item.qty,
        size: item.size,
        color: item.color,
        image: item.products.images && item.products.images[0] ? item.products.images[0] : '/src/assets/cart/bangle1.webp',
        deliveryDate: "2 - 3 days"
      };
    });
  },

  /**
   * Adds a single item to user's cart.
   * @param {string} userId
   * @param {number} productId
   * @param {number} qty
   * @param {string|null} size
   * @param {string|null} color
   */
  async addCartItem(userId, productId, qty = 1, size = null, color = null) {
    const { data, error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: userId,
        product_id: productId,
        qty,
        size: size || '',
        color: color || ''
      }, { onConflict: 'user_id,product_id,size,color' })
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
      .upsert(items, { onConflict: 'user_id,product_id,size,color' })
      .select();

    if (error) throw error;
    return data;
  }
};
