import type { TemplateId } from '../types';

export interface TemplateConfig {
  id: TemplateId;
  name: string;
  emoji: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  previewGradient: string;
}

export const TEMPLATES: Record<TemplateId, TemplateConfig> = {
  kosmetik: {
    id: 'kosmetik',
    name: 'Kosmetik & Beauty',
    emoji: '💆',
    description: 'Elegant, Rosé Gold & Creme — perfekt für Beauty-Studios, Nagelstudios, Kosmetiksalons',
    primaryColor: '#c9a99a',
    secondaryColor: '#8b6f6f',
    accentColor: '#b8887a',
    bgColor: '#fdf6f0',
    textColor: '#3d2b2b',
    previewGradient: 'linear-gradient(135deg, #c9a99a 0%, #b8887a 50%, #fdf6f0 100%)',
  },
  friseur: {
    id: 'friseur',
    name: 'Friseur & Styling',
    emoji: '✂️',
    description: 'Sleek, Schwarz & Gold — perfekt für Friseursalons, Barbershops, Styling-Studios',
    primaryColor: '#d4a843',
    secondaryColor: '#111111',
    accentColor: '#f0c55a',
    bgColor: '#111111',
    textColor: '#f5f5f5',
    previewGradient: 'linear-gradient(135deg, #111111 0%, #1c1c1c 50%, #d4a843 100%)',
  },
  massage: {
    id: 'massage',
    name: 'Massage & Wellness',
    emoji: '🧘',
    description: 'Natürlich, Salbei & Beige — perfekt für Massagepraxen, Wellnessstudios, Physiotherapie',
    primaryColor: '#5b8c5a',
    secondaryColor: '#3b5c3a',
    accentColor: '#8ab07f',
    bgColor: '#f5f0e8',
    textColor: '#2e4a2e',
    previewGradient: 'linear-gradient(135deg, #5b8c5a 0%, #8ab07f 50%, #f5f0e8 100%)',
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);
