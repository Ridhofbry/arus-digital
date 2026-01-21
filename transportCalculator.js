// src/utils/transportCalculator.js

/**
 * Calculate transport cost based on location
 * @param {string} location - City or district name
 * @returns {Object} - { cost: string, message: string, isFree: boolean }
 */
export const calculateTransportCost = (location) => {
  if (!location) return null;
  
  const loc = location.toLowerCase().trim();
  
  // Free shipping zones
  const freeZones = ['singosari', 'lawang', 'pakis'];
  if (freeZones.some(zone => loc.includes(zone))) {
    return {
      cost: 'GRATIS (0 Rupiah)',
      message: 'Free Ongkir Area',
      isFree: true,
      zone: 'free'
    };
  }
  
  // Transport pricing database
  const transportRates = {
    // Malang Raya
    'malang': { cost: 'Rp 75.000', zone: 'close' },
    'batu': { cost: 'Rp 150.000', zone: 'close' },
    'kepanjen': { cost: 'Rp 120.000', zone: 'close' },
    'karangploso': { cost: 'Rp 50.000', zone: 'close' },
    'tumpang': { cost: 'Rp 80.000', zone: 'close' },
    
    // East Java - Medium Distance
    'pandaan': { cost: 'Rp 150.000', zone: 'medium' },
    'pasuruan': { cost: 'Rp 200.000', zone: 'medium' },
    'sidoarjo': { cost: 'Rp 350.000', zone: 'medium' },
    'surabaya': { cost: 'Rp 450.000', zone: 'medium' },
    'mojokerto': { cost: 'Rp 400.000', zone: 'medium' },
    'probolinggo': { cost: 'Rp 300.000', zone: 'medium' },
    'lumajang': { cost: 'Rp 250.000', zone: 'medium' },
    
    // East Java - Far Distance
    'blitar': { cost: 'Rp 500.000', zone: 'far' },
    'kediri': { cost: 'Rp 600.000', zone: 'far' },
    'tulungagung': { cost: 'Rp 550.000', zone: 'far' },
    'jember': { cost: 'Rp 700.000', zone: 'far' },
    'banyuwangi': { cost: 'Rp 900.000', zone: 'far' },
    
    // Major Cities (Requires Flight)
    'jakarta': { cost: 'Tiket Pesawat + Akomodasi', zone: 'flight' },
    'bandung': { cost: 'Tiket Pesawat + Akomodasi', zone: 'flight' },
    'bali': { cost: 'Tiket Pesawat + Akomodasi', zone: 'flight' },
    'denpasar': { cost: 'Tiket Pesawat + Akomodasi', zone: 'flight' },
    'yogyakarta': { cost: 'Tiket Pesawat + Akomodasi', zone: 'flight' },
    'semarang': { cost: 'Tiket Pesawat + Akomodasi', zone: 'flight' },
  };
  
  // Find matching city
  for (const [city, info] of Object.entries(transportRates)) {
    if (loc.includes(city)) {
      return {
        cost: info.cost,
        message: info.zone === 'flight' 
          ? `Layanan Full Production (${city})` 
          : `Estimasi Grab Car dari Singosari ke ${city}`,
        isFree: false,
        zone: info.zone,
        city: city
      };
    }
  }
  
  // Location not found
  return {
    cost: 'Hubungi Admin',
    message: 'Lokasi belum terdaftar di database',
    isFree: false,
    zone: 'unknown'
  };
};

/**
 * Get recommended transport note based on zone
 */
export const getTransportNote = (zone) => {
  const notes = {
    free: 'Gratis! Tim siap datang tanpa biaya tambahan.',
    close: 'Termasuk transport tim PP via Grab Car.',
    medium: 'Estimasi untuk 1 unit mobil (maks 4 crew).',
    far: 'Recommend menginap 1 malam. Akomodasi dibicarakan terpisah.',
    flight: 'Untuk event besar di luar Jawa Timur. Paket custom production.',
    unknown: 'Silakan hubungi admin untuk pengecekan detail.'
  };
  return notes[zone] || notes.unknown;
};
