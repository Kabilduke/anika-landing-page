import { supabase } from '../lib/supabase';

export const productService = {
  /**
   * Retrieves all categories.
   * @returns {Promise<any[]>}
   */
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*, subcategories(*), products(count)')
        .order('sort_order', { ascending: true });
      if (!error && data) {
        return data.map(c => ({
          ...c,
          productCount: c.products?.[0]?.count ?? 0,
          subcategories: (c.subcategories || []).filter(s => s.is_active !== false)
        }));
      }
    } catch (e) {
      console.warn('Foreign key subcategories join fallback:', e);
    }

    const { data: cats, error: catErr } = await supabase
      .from('categories')
      .select('*, products(count)')
      .order('sort_order', { ascending: true });
    if (catErr) throw catErr;

    const { data: subs } = await supabase
      .from('subcategories')
      .select('*')
      .order('created_at', { ascending: false });

    const subsByParent = {};
    (subs || []).forEach(s => {
      if (s.parent_id) {
        if (!subsByParent[s.parent_id]) subsByParent[s.parent_id] = [];
        subsByParent[s.parent_id].push(s);
      }
    });

    return (cats || []).map(c => ({
      ...c,
      productCount: c.products?.[0]?.count ?? 0,
      subcategories: subsByParent[c.category_id] || subsByParent[c.id] || []
    }));
  },

  /**
   * Retrieves all products.
   * @returns {Promise<any[]>}
   */
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), subcategories(name), product_variants(variant_id, price, compare_price, stock, sku, color, size, images)')
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
   * Helper to ensure Postgres text[] array columns (colors, sizes, images) are valid arrays.
   */
  formatProductPayload(productData) {
    if (!productData) return {};
    const payload = { ...productData };

    if (payload.colors !== undefined && payload.colors !== null) {
      if (typeof payload.colors === 'string') {
        payload.colors = payload.colors.split(',').map(c => c.trim()).filter(Boolean);
      } else if (!Array.isArray(payload.colors)) {
        payload.colors = [String(payload.colors)];
      }
      if (payload.colors.length === 0) payload.colors = null;
    }

    if (payload.sizes !== undefined && payload.sizes !== null) {
      if (typeof payload.sizes === 'string') {
        payload.sizes = payload.sizes.split(',').map(s => s.trim()).filter(Boolean);
      } else if (!Array.isArray(payload.sizes)) {
        payload.sizes = [String(payload.sizes)];
      }
      if (payload.sizes.length === 0) payload.sizes = null;
    }

    if (payload.images !== undefined && payload.images !== null) {
      if (!Array.isArray(payload.images)) {
        payload.images = [payload.images].filter(Boolean);
      }
    }

    return payload;
  },

  /**
   * Inserts a new product record.
   * @param {object} productData 
   * @returns {Promise<any>}
   */
  async insertProduct(productData) {
    const formatted = this.formatProductPayload(productData);
    const { data, error } = await supabase
      .from('products')
      .insert([formatted])
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
    const formatted = this.formatProductPayload(productData);
    const { data, error } = await supabase
      .from('products')
      .update(formatted)
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
  getProductImagePublicUrl(filePath, width = 600) {
    const { data } = supabase.storage
      .from('product_img')
      .getPublicUrl(
        filePath, {
        transform: {
          width,
          quanlity: 75,
          format: "webp",
        }
      });
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
  getCategoryImagePublicUrl(filePath, width = 400) {
    const { data } = supabase.storage
      .from('categories_img')
      .getPublicUrl(filePath, {
        transform: {
          width,
          quality: 75,
        },
      });
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

    let queryData = null;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, subcategories(name), product_variants(price, compare_price, stock, images, )')
        .eq('category_id', catData.category_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        queryData = data.map(p => ({
          ...p,
          subcategory: p.subcategories?.name || p.subcategory || null
        }));
      }
    } catch (e) {
      console.warn('Subcategories join fallback in getProductsByCategoryName:', e);
    }

    if (!queryData) {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(price, compare_price, stock, images)')
        .eq('category_id', catData.category_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const subIds = (data || []).map(p => p.subcategory_id).filter(Boolean);
      let subMap = {};
      if (subIds.length > 0) {
        const { data: subRows } = await supabase
          .from('subcategories')
          .select('subcategory_id, name')
          .in('subcategory_id', subIds);

        (subRows || []).forEach(s => {
          subMap[s.subcategory_id] = s.name;
        });
      }

      queryData = (data || []).map(p => ({
        ...p,
        subcategory: subMap[p.subcategory_id] || p.subcategory || null
      }));
    }

    return queryData;
  },

  /**
   * Searches active products by name.
   * @param {string} query
   * @param {number} limit
   * @returns {Promise<any[]>}
   */
  async searchProductsByName(query, limit = 5) {
    const normalizedQuery = String(query || '').trim();
    if (!normalizedQuery) return [];

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('is_active', true)
      .ilike('name', `%${normalizedQuery}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async uploadSubcategoryImage(filePath, file) {
    const { data, error } = await supabase.storage
      .from('subcategories_img')   // create this bucket in Supabase Storage first
      .upload(filePath, file);
    if (error) throw error;
    return data;
  },

  getSubcategoryImagePublicUrl(filePath, width = 400) {
    const { data } = supabase.storage
      .from('subcategories_img')
      .getPublicUrl(filePath, {
        transform: {
          width,
          quality: 75
        },
      });
    return data.publicUrl;
  },

  /**
  * Retrieves subcategories.
  * @param {number|null} parentId
  * @returns {Promise<any[]>}
  */
  async getSubCategories(parentId = null) {
    let query = supabase
      .from("subcategories")
      .select("*")
      .order("created_at", { ascending: false });

    if (parentId !== null && parentId !== undefined) {
      query = query.eq("parent_id", parentId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Creates a subcategory.
   * @param {object} payload
   * @returns {Promise<any>}
   */
  async createSubcategory(payload) {
    const { data, error } = await supabase
      .from("subcategories")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Updates a subcategory.
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<any>}
   */
  async updateSubcategory(id, payload) {
    const { data, error } = await supabase
      .from("subcategories")
      .update(payload)
      .eq("subcategory_id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Deletes a subcategory.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async deleteSubcategory(id) {
    const { error } = await supabase
      .from("subcategories")
      .delete()
      .eq("subcategory_id", id);

    if (error) throw error;
  },
};
