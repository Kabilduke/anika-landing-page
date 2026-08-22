import { supabase } from '../lib/supabase';

const generateSku = (productName, size, color) => {
  const base = productName.replace(/\s+/g, '-').toUpperCase().slice(0, 10);
  const sizePart = size ? size.replace(/\s+/g, '').toUpperCase() : 'STD';
  const colorPart = color ? color.replace('#', '') : 'DEF';
  return `${base}-${sizePart}-${colorPart}-${Date.now().toString().slice(-4)}`;
};

export const variantService = {
  /**
   * Creates a base product plus all its variants in one flow.
   * @param {object} productData - base product row (name, category_id, description, is_active, is_featured, etc.)
   * @param {any[]} variants - array from ProductVariant.jsx form state
   */
  async createProductWithVariants(productData, variants) {
    // 1. Insert the base/parent product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([{ ...productData, has_variants: true }])
      .select()
      .single();
    if (productError) throw productError;

    // 2. Upload each variant's images, then build variant rows
    const variantRows = [];
    for (const v of variants) {
      const imageUrls = await this._uploadVariantImages(v.media, product.name);

      variantRows.push({
        product_id: product.product_id,
        sku: v.sku?.trim() || generateSku(product.name, v.sizeDimension, v.color),
        size: v.sizeDimension || null,
        color: v.color || null,
        price: parseFloat(v.sellingPrice) || 0,      // actual selling price
        compare_price: parseFloat(v.price) || null,  // MRP
        stock: parseInt(v.stockQuantity) || 0,
        stock_alert: parseInt(v.minStockAlert) || null,
        images: imageUrls,
        is_active: true,
      });
    }

    // 3. Insert all variants together
    const { data: insertedVariants, error: variantError } = await supabase
      .from('product_variants')
      .insert(variantRows)
      .select();

    if (variantError) {
      // Roll back the orphaned parent product if variant insert fails
      await supabase.from('products').delete().eq('product_id', product.product_id);
      throw variantError;
    }

    return { product, variants: insertedVariants };
  },

  async _uploadVariantImages(mediaItems, productName) {
    if (!mediaItems || mediaItems.length === 0) return [];
    const urls = [];
    for (const item of mediaItems) {
      const fileExt = item.file.name.split('.').pop();
      const fileName = `${productName.replace(/\s+/g, '-').toLowerCase()}-variant-${Date.now()}.${fileExt}`;
      const filePath = `products/variants/${fileName}`;
      const { error } = await supabase.storage.from('product_img').upload(filePath, item.file);
      if (error) throw error;
      const { data } = supabase.storage.from('product_img').getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }
    return urls;
  },

  /**
   * Retrieves all variants for a product.
   */
  async getVariantsByProductId(productId) {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async updateVariant(variantId, variantData) {
    const { data, error } = await supabase
      .from('product_variants')
      .update(variantData)
      .eq('variant_id', variantId)
      .select();
    if (error) throw error;
    return data;
  },

  async deleteVariant(variantId) {
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('variant_id', variantId);
    if (error) throw error;
  },
};