// src/utils/whatsappFormatter.js

/**
 * Format booking data for WhatsApp message
 * @param {Object} bookingData - Booking information
 * @returns {string} - Formatted WhatsApp message
 */
export const formatBookingMessage = ({
  service,
  category,
  location,
  transportCost,
  hours,
  date,
  additionalNotes = ''
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('id-ID', options);
  };

  const message = `Halo Arus Digital! 👋

Saya tertarik untuk booking jasa live streaming event.

🎥 *DETAIL BOOKING*
━━━━━━━━━━━━━━━━━━━━
📦 Paket Service: *${service || '-'}*
🎯 Kategori Event: *${category || '-'}*
📍 Lokasi Event: *${location || '-'}*
🚗 Estimasi Transport: *${transportCost || 'Belum Dicek'}*
⏱️ Durasi: *${hours || '-'} Jam*
📅 Tanggal: *${formatDate(date)}*

${additionalNotes ? `📝 Catatan Tambahan:\n${additionalNotes}\n\n` : ''}Mohon info ketersediaan crew dan detail selanjutnya.

Terima kasih! 🙏`;

  return encodeURIComponent(message);
};

/**
 * Generate WhatsApp URL
 */
export const generateWhatsAppURL = (phoneNumber, message) => {
  // Remove any non-digit characters except '+'
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  return `https://wa.me/${cleanPhone}?text=${message}`;
};

/**
 * Open WhatsApp with formatted message
 */
export const sendWhatsAppBooking = (bookingData, phoneNumber = '6285731021469') => {
  const message = formatBookingMessage(bookingData);
  const url = generateWhatsAppURL(phoneNumber, message);
  window.open(url, '_blank');
};

/**
 * Format price display
 */
export const formatPrice = (price) => {
  if (typeof price === 'string') return price;
  if (typeof price === 'number') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  }
  return 'Hubungi Admin';
};
