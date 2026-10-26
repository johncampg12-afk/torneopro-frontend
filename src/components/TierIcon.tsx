import { Box } from '@mui/material';

// Tier icons Lucide-style - progresión profesional
// bronze → medal, silver → trophy, gold → crown, diamond → gem

export const TIER_ICON_PATHS: Record<string, React.ReactNode> = {
  // ─── Bronze ─── (award / medal)
  bronze: (
    <>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </>
  ),

  // ─── Silver ─── (trophy)
  silver: (
    <>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v9a6 6 0 0 0 12 0V2Z" />
    </>
  ),

  // ─── Gold ─── (crown)
  gold: (
    <>
      <path d="M2 20h20" />
      <path d="M5 20L3 8l5.5 4L12 2l3.5 10L21 8l-2 12Z" />
    </>
  ),

  // ─── Diamond ─── (gem)
  diamond: (
    <>
      <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z" />
      <path d="M12 2L2.7 10.3a2.41 2.41 0 0 0 0 3.41L12 23l9.3-9.29a2.41 2.41 0 0 0 0-3.41L12 2Z" />
    </>
  ),
};

interface TierIconProps {
  slug: string;
  size?: number;
}

export const TierIcon = ({ slug, size = 16 }: TierIconProps) => {
  const content = TIER_ICON_PATHS[slug];
  if (!content) return null;

  return (
    <Box
      component="svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      sx={{ display: 'block', flexShrink: 0 }}
    >
      {content}
    </Box>
  );
};