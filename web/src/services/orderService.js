import { supabase } from '../lib/supabase';

export const orderService = {
  /**
   * Retrieves all orders for a specific user.
   * @param {string} userId 
   * @returns {Promise<any[]>}
   */
  async getOrders(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('order_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  /**
   * Retrieves all addresses for a specific user.
   * @param {string} userId 
   * @returns {Promise<any[]>}
   */
  async getAddresses(userId) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  /**
   * Creates a new address for a user.
   * @param {object} addressData 
   * @returns {Promise<any>}
   */
  async createAddress(addressData) {
    const { data, error } = await supabase
      .from('addresses')
      .insert(addressData)
      .select();
    if (error) throw error;
    return data;
  },

  /**
   * Updates an existing address.
   * @param {string|number} addressId 
   * @param {object} addressData 
   * @returns {Promise<any>}
   */
  async updateAddress(addressId, addressData) {
    const { data, error } = await supabase
      .from('addresses')
      .update(addressData)
      .eq('address_id', addressId)
      .select();
    if (error) throw error;
    return data;
  },

  /**
   * Deletes a specific address.
   * @param {string|number} addressId 
   * @param {string} userId 
   * @returns {Promise<void>}
   */
  async deleteAddress(addressId, userId) {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('address_id', addressId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  /**
   * Resets default status for all user addresses to false.
   * @param {string} userId 
   * @returns {Promise<void>}
   */
  async resetAddressDefaults(userId) {
    const { error } = await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
    if (error) throw error;
  },

  /**
   * Sets a specific address as the user's default address.
   * @param {string|number} addressId 
   * @param {string} userId 
   * @returns {Promise<void>}
   */
  async setAddressDefault(addressId, userId) {
    // 1. Reset all addresses to is_default = false
    await this.resetAddressDefaults(userId);

    // 2. Set this address to is_default = true
    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('address_id', addressId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  /**
   * Retrieves all orders in the system (admin view).
   * @returns {Promise<any[]>}
   */
  async getAllOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('order_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  /**
   * Retrieves all customer profiles in the system (admin view).
   * @returns {Promise<any[]>}
   */
  async getAllCustomers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  /**
   * Updates the status of a specific order.
   * @param {string} orderId 
   * @param {string} status 
   * @returns {Promise<any>}
   */
  async updateOrderStatus(orderId, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select();
    if (error) throw error;
    return data;
  },

  /**
   * Updates the admin note for a specific order.
   * @param {string} orderId 
   * @param {string} note 
   * @returns {Promise<any>}
   */
  async updateOrderNote(orderId, note) {
    const { data, error } = await supabase
      .from('orders')
      .update({ admin_notes: note })
      .eq('id', orderId)
      .select();
    if (error) throw error;
    return data;
  },

  /**
   * Cancels a specific order.
   * @param {string} orderId 
   * @returns {Promise<any>}
   */
  async cancelOrder(orderId) {
    const { data, error } = await supabase.functions.invoke('ekart', {
      body: {
        action: "cancel_order",
        orderId: orderId,
      }
    });
    if (error) throw error;
    return data;
  }
};
