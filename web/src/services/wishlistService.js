import { supabase } from '../lib/supabase';

/** Strip currency symbols & commas so "₹1,299" → 1299 */
const parsePrice = (v) => {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(/[₹,\s]/g, ''));
  return isNaN(n) ? 0 : n;
};

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
      .select('*, products(*, categories(name), product_variants(*))')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(item => {
      const product = item.products;
      if (!product) return null;

      const variants = product.product_variants || [];
      let price = 0;
      let originalPrice = 0;
      let image = product.image_url || (product.images && product.images[0]) || '/src/assets/cart/bangle1.webp';

      if (variants.length > 0) {
        const sortedVariants = [...variants].sort((a, b) => (parsePrice(a.price) || 0) - (parsePrice(b.price) || 0));
        const primaryVariant = sortedVariants[0];
        price = parsePrice(primaryVariant.price);
        originalPrice = parsePrice(primaryVariant.compare_price || Math.round(price * 1.3));
        if (primaryVariant.images && primaryVariant.images.length > 0) {
          image = primaryVariant.images[0];
        }
      } else {
        const rawPrice = parsePrice(product.price);
        const rawDiscount = parsePrice(product.discount_price);
        price = rawDiscount > 0 ? rawPrice - rawDiscount : rawPrice;
        originalPrice = parsePrice(product.compare_price || Math.round(rawPrice * 1.3));
      }

      return {
        id: product.product_id,
        dbId: item.id,
        name: product.name || '',
        price: price,
        originalPrice: originalPrice,
        category: product.categories?.name || '',
        qty: 1,
        image: image,
        deliveryDate: '2 - 3 Days'
      };
    }).filter(Boolean);
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
