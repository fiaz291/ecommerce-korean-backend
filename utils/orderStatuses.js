// Order statuses utility
const orderStatuses = {
  pending: { key: 'pending', label: 'Pending' },
  processing: { key: 'processing', label: 'Processing' },
  shipped: { key: 'shipped', label: 'Shipped' },
  delivered: { key: 'delivered', label: 'Delivered' },
  cancelled: { key: 'cancelled', label: 'Cancelled' },
};

module.exports = { orderStatuses };

