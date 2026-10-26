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
    id: 'descuento-tienda-z',
    title: 'Aretes Plata 925',
    description: 'Realza cualquier look con estos elegantes pendientes de botón con piedra brillante.',
    sponsor: 'TrendSport',
    cost: 2000,
    tier: 'bronze',
    image: '/rewards/aretes.png',
  },

  // ══════════ PLATA ══════════
  {
    id: 'camiseta-tienda-u',
    title: 'Zapatillas Nike Benassi Estampado',
    description: 'Dale un toque de estilo y comodidad a tus días con estas Nike Benassi',
    sponsor: 'La Casa de las Zapatillas',
    cost: 5000,
    tier: 'silver',
    image: '/rewards/sandalias1.png',
  },

  // ══════════ ORO ══════════

  // ══════════ DIAMANTE ══════════
];

export const TIER_INFO = {
  bronze: { label: 'Bronce', emoji: '🥉', color: '#CD7F32', bg: 'rgba(205,127,50,0.08)' },
  silver: { label: 'Plata', emoji: '🥈', color: '#64748B', bg: 'rgba(100,116,139,0.08)' },
  gold: { label: 'Oro', emoji: '🥇', color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
  diamond: { label: 'Diamante', emoji: '💎', color: '#0284C7', bg: 'rgba(2,132,199,0.08)' },
} as const;

// Número de WhatsApp al que se envían los canjes
export const ORGANIZER_WHATSAPP = '593999999999'; // ← cámbialo por el real