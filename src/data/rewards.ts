export interface Reward {
  id: string;
  title: string;
  description: string;
  sponsor: string;
  sponsorLogo?: string;
  cost: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  image: string;
}

export const REWARDS: Reward[] = [
  // ══════════ BRONCE ══════════
  {
    id: 'cafe-solo-cafeteria-x',
    title: 'Café solo',
    description: 'Un café de especialidad en Cafetería X',
    sponsor: 'Cafetería X',
    cost: 500,
    tier: 'bronze',
    image: '/rewards/cafe-solo.jpg',
  },
  {
    id: 'cerveza-tapa-bar-y',
    title: 'Cerveza + tapa',
    description: 'Una cerveza nacional con tapa en Bar Y',
    sponsor: 'Bar Y',
    cost: 1000,
    tier: 'bronze',
    image: '/rewards/cerveza-tapa.jpg',
  },
  {
    id: 'descuento-tienda-z',
    title: '10% de descuento',
    description: 'En cualquier compra en Tienda Deportiva Z',
    sponsor: 'Tienda Deportiva Z',
    cost: 2000,
    tier: 'bronze',
    image: '/rewards/descuento-10.jpg',
  },

  // ══════════ PLATA ══════════
  {
    id: 'menu-dia-restaurante-w',
    title: 'Menú del día',
    description: 'Menú completo en Restaurante W',
    sponsor: 'Restaurante W',
    cost: 5000,
    tier: 'silver',
    image: '/rewards/menu-dia.jpg',
  },
  {
    id: 'sesion-fisio-clinica-v',
    title: 'Sesión de fisio',
    description: 'Sesión de fisioterapia en Clínica V',
    sponsor: 'Clínica V',
    cost: 8000,
    tier: 'silver',
    image: '/rewards/fisio.jpg',
  },
  {
    id: 'camiseta-tienda-u',
    title: 'Camiseta deportiva',
    description: 'Una camiseta oficial en Tienda U',
    sponsor: 'Tienda U',
    cost: 15000,
    tier: 'silver',
    image: '/rewards/camiseta.jpg',
  },

  // ══════════ ORO ══════════
  {
    id: 'cena-2-restaurante-t',
    title: 'Cena para 2',
    description: 'Cena completa para dos personas en Restaurante T',
    sponsor: 'Restaurante T',
    cost: 30000,
    tier: 'gold',
    image: '/rewards/cena-2.jpg',
  },
  {
    id: 'bono-30-tienda-s',
    title: 'Bono de $30',
    description: 'Bono de compra en Tienda Deportiva S',
    sponsor: 'Tienda Deportiva S',
    cost: 50000,
    tier: 'gold',
    image: '/rewards/bono-30.jpg',
  },

  // ══════════ DIAMANTE ══════════
  {
    id: 'descuento-50-tienda',
    title: '50% de descuento',
    description: 'En una compra grande en cualquier tienda asociada',
    sponsor: 'Varios',
    cost: 200000,
    tier: 'diamond',
    image: '/rewards/descuento-50.jpg',
  },
  {
    id: 'smartwatch-top',
    title: 'Smartwatch',
    description: 'Smartwatch o auriculares de gama alta',
    sponsor: 'TrendSport',
    cost: 300000,
    tier: 'diamond',
    image: '/rewards/smartwatch.jpg',
  },
  {
    id: 'iphone',
    title: 'iPhone',
    description: 'iPhone o dispositivo equivalente de última generación',
    sponsor: 'TrendSport',
    cost: 500000,
    tier: 'diamond',
    image: '/rewards/iphone.jpg',
  },
];

export const TIER_INFO = {
  bronze: { label: 'Bronce', emoji: '🥉', color: '#CD7F32', bg: 'rgba(205,127,50,0.08)' },
  silver: { label: 'Plata', emoji: '🥈', color: '#64748B', bg: 'rgba(100,116,139,0.08)' },
  gold: { label: 'Oro', emoji: '🥇', color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
  diamond: { label: 'Diamante', emoji: '💎', color: '#0284C7', bg: 'rgba(2,132,199,0.08)' },
} as const;

// Número de WhatsApp al que se envían los canjes
export const ORGANIZER_WHATSAPP = '593999999999'; // ← cámbialo por el real