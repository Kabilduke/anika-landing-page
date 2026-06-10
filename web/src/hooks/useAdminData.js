import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { orderService } from '../services/orderService';

export function useAdminData() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedOrders, fetchedCustomers] = await Promise.all([
        orderService.getAllOrders(),
        orderService.getAllCustomers(),
      ]);
      setOrders(fetchedOrders);
      setCustomers(fetchedCustomers);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to realtime database changes
    const channel = supabase
      .channel('admin-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Realtime Order Change:', payload);
          const { eventType, new: newRecord, old: oldRecord } = payload;
          setOrders((currentOrders) => {
            if (eventType === 'INSERT') {
              // Prepend new order if not already in list
              if (currentOrders.some((o) => o.id === newRecord.id)) {
                return currentOrders;
              }
              return [newRecord, ...currentOrders];
            }
            if (eventType === 'UPDATE') {
              return currentOrders.map((o) => (o.id === newRecord.id ? newRecord : o));
            }
            if (eventType === 'DELETE') {
              return currentOrders.filter((o) => o.id !== oldRecord.id);
            }
            return currentOrders;
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('Realtime Customer Change:', payload);
          const { eventType, new: newRecord, old: oldRecord } = payload;
          setCustomers((currentCustomers) => {
            if (eventType === 'INSERT') {
              if (currentCustomers.some((c) => c.id === newRecord.id)) {
                return currentCustomers;
              }
              return [newRecord, ...currentCustomers];
            }
            if (eventType === 'UPDATE') {
              return currentCustomers.map((c) => (c.id === newRecord.id ? newRecord : c));
            }
            if (eventType === 'DELETE') {
              return currentCustomers.filter((c) => c.id !== oldRecord.id);
            }
            return currentCustomers;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      // Optimistically update order status locally
      setOrders((currentOrders) =>
        currentOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  const aggregatedOrders = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      customer: customers.find((c) => c.id === order.user_id) || {
        id: order.user_id,
        name: 'Unknown Customer',
        phone: 'N/A',
        email: 'N/A',
      },
    }));
  }, [orders, customers]);

  const aggregatedCustomers = useMemo(() => {
    return customers.map((customer) => {
      const customerOrders = orders.filter((o) => o.user_id === customer.id);
      const totalSpent = customerOrders
        .filter((o) => {
          const s = o.status?.toLowerCase();
          return s !== 'cancelled' && s !== 'returned';
        })
        .reduce((sum, o) => sum + Number(o.total_price || 0), 0);
      return {
        ...customer,
        orderCount: customerOrders.length,
        totalSpent,
      };
    });
  }, [orders, customers]);

  return {
    orders: aggregatedOrders,
    rawOrders: orders,
    customers: aggregatedCustomers,
    rawCustomers: customers,
    loading,
    error,
    refetch: fetchData,
    updateOrderStatus,
  };
}
