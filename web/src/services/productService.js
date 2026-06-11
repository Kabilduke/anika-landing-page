import { supabase } from '../lib/supabase';

export const productService = {
  /**
   * Retrieves all categories.
   * @returns {Promise<any[]>}
   */
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  /**
   * Retrieves all products.
   * @returns {Promise<any[]>}
   */
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  /**
   * Deletes a product by product_id.
   * @param {string|number} productId 
   * @returns {Promise<void>}
   */
  async deleteProduct(productId) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('product_id', productId);
    if (error) throw error;
  },

  /**
   * Deletes a category by category_id.
   * @param {string|number} categoryId 
   * @returns {Promise<void>}
   */
  async deleteCategory(categoryId) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('category_id', categoryId);
    if (error) throw error;
  },

  /**
   * Inserts a new product record.
   * @param {object} productData 
   * @returns {Promise<any>}
   */
  async insertProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();
    if (error) throw error;
    return data;
  },

  /**
   * Inserts a new category record.
   * @param {object} categoryData 
   * @returns {Promise<any>}
   */
  async insertCategory(categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select();
    if (error) throw error;
    return data;
  },

  /**
   * Updates an existing category.
   * @param {string|number} categoryId 
   * @param {object} categoryData 
   * @returns {Promise<any>}
   */
  async updateCategory(categoryId, categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('category_id', categoryId)
      .select();
    if (error) throw error;
    return data;
  },

  /**
   * Updates an existing product.
   * @param {string|number} productId 
   * @param {object} productData 
   * @returns {Promise<any>}
   */
  async updateProduct(productId, productData) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('product_id', productId)
      .select();
    if (error) throw error;
    return data;
  },

  /**
   * Uploads an image file to the product-images storage bucket.
   * @param {string} filePath 
   * @param {File} file 
   * @returns {Promise<any>}
   */
  async uploadProductImage(filePath, file) {
    const { data, error } = await supabase.storage
      .from('product_img')
      .upload(filePath, file);
    if (error) throw error;
    return data;
  },

  /**
   * Resolves the public URL for a product image.
   * @param {string} filePath 
   * @returns {string}
   */
  getProductImagePublicUrl(filePath) {
    const { data } = supabase.storage
      .from('product_img')
      .getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Uploads an image file to the category-images storage bucket.
   * @param {string} filePath 
   * @param {File} file 
   * @returns {Promise<any>}
   */
  async uploadCategoryImage(filePath, file) {
    const { data, error } = await supabase.storage
      .from('categories_img')
      .upload(filePath, file);
    if (error) throw error;
    return data;
  },

  /**
   * Resolves the public URL for a category image.
   * @param {string} filePath 
   * @returns {string}
   */
  getCategoryImagePublicUrl(filePath) {
    const { data } = supabase.storage
      .from('categories_img')
      .getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Retrieves active products for a specific category name.
   * @param {string} categoryName
   * @returns {Promise<any[]>}
   */
  async getProductsByCategoryName(categoryName) {
    const { data: catData, error: catError } = await supabase
      .from('categories')
      .select('category_id')
      .eq('name', categoryName)
      .eq('is_active', true)
      .maybeSingle();

    if (catError) throw catError;
    if (!catData) return [];

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', catData.category_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
