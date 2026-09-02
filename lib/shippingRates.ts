export interface Region {
  id: string;
  name: string;
  shippingCost: number;
}

export const REGIONS: Region[] = [
  // Zonas Extremas Norte
  { id: 'XV', name: 'Arica y Parinacota', shippingCost: 7500 },
  { id: 'I', name: 'Tarapacá', shippingCost: 7500 },
  { id: 'II', name: 'Antofagasta', shippingCost: 6500 },
  
  // Zonas Medias Norte
  { id: 'III', name: 'Atacama', shippingCost: 5500 },
  { id: 'IV', name: 'Coquimbo', shippingCost: 4500 },
  
  // Centro
  { id: 'V', name: 'Valparaíso', shippingCost: 3800 },
  { id: 'XIII', name: 'Metropolitana de Santiago', shippingCost: 3200 },
  { id: 'VI', name: 'Libertador Gral. Bernardo O’Higgins', shippingCost: 3800 },
  { id: 'VII', name: 'Maule', shippingCost: 4200 },
  
  // Sur
  { id: 'XVI', name: 'Ñuble', shippingCost: 4500 },
  { id: 'VIII', name: 'Biobío', shippingCost: 4800 },
  { id: 'IX', name: 'La Araucanía', shippingCost: 5200 },
  { id: 'XIV', name: 'Los Ríos', shippingCost: 5500 },
  { id: 'X', name: 'Los Lagos', shippingCost: 5800 },
  
  // Zonas Extremas Sur
  { id: 'XI', name: 'Aysén del Gral. Carlos Ibáñez del Campo', shippingCost: 8500 },
  { id: 'XII', name: 'Magallanes y de la Antártica Chilena', shippingCost: 8500 },
];
