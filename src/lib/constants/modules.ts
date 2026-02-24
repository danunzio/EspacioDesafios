import { FileText, Briefcase, Heart, Clock } from 'lucide-react';

export const VALUE_TYPES = [
  { value: 'nomenclatura', label: 'Nomenclador' },
  { value: 'modulos', label: 'Módulos' },
  { value: 'osde', label: 'OSDE' },
  { value: 'sesion', label: 'Sesión Individual' }
] as const;

export const valueTypeIcons: Record<string, typeof FileText> = {
  nomenclatura: FileText,
  modulos: Briefcase,
  osde: Heart,
  sesion: Clock
};

export const valueTypeColors: Record<string, string> = {
  nomenclatura: '#A38EC3',
  modulos: '#F4C2C2',
  osde: '#A8E6CF',
  sesion: '#F9E79F'
};

export const valueTypeLabels: Record<string, string> = {
  nomenclatura: 'Nomenclador',
  modulos: 'Módulos',
  osde: 'OSDE',
  sesion: 'Sesión Individual'
};
