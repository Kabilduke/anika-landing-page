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
      .select('*, products(*, categories(name), product_variants(*))')
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map(item => {
      const product = item.products;
      if (!product) {
        return {
          id: item.id,
          productId: item.product_id,
          name: 'Product',
          price: 0,
          originalPrice: 0,
          category: '',
          qty: item.qty || 1,
          size: item.size || null,
          color: item.color || null,
          image: '/src/assets/cart/bangle1.webp',
          deliveryDate: "2 - 3 days"
        };
      }

      const variants = product.product_variants || [];
      let matchedVariant = null;
      if (variants.length > 0) {
        matchedVariant = variants.find(v => {
          const matchSize = item.size ? String(v.size || '').trim().toLowerCase() === String(item.size).trim().toLowerCase() : true;
          const matchColor = item.color ? String(v.color || '').trim().toLowerCase() === String(item.color).trim().toLowerCase() : true;
          return matchSize && matchColor;
        }) || variants.find(v => {
          return item.size ? String(v.size || '').trim().toLowerCase() === String(item.size).trim().toLowerCase() : true;
        }) || variants[0];
      }

      let price = 0;
      let originalPrice = 0;
      let image = product.image_url || (product.images && product.images[0]) || '/src/assets/cart/bangle1.webp';

      if (matchedVariant) {
        price = parsePrice(matchedVariant.price);
        originalPrice = parsePrice(matchedVariant.compare_price || Math.round(price * 1.3));
        if (matchedVariant.images && matchedVariant.images.length > 0) {
          image = matchedVariant.images[0];
        }
      } else {
        const rawPrice = parsePrice(product.price);
        const rawDiscount = parsePrice(product.discount_price);
        price = rawDiscount > 0 ? rawPrice - rawDiscount : rawPrice;
        originalPrice = parsePrice(product.compare_price || Math.round(rawPrice * 1.3));
      }

      return {
        id: item.id,
        productId: item.product_id,
        name: product.name || '',
        price: price,
        originalPrice: originalPrice,
        category: product.categories?.name || '',
        qty: item.qty || 1,
        size: item.size || null,
        color: item.color || null,
        image: image,
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
