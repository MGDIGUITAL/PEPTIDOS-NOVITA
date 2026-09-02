export interface PickupPoint {
  region: string;
  comuna: string;
  name: string;
  address: string;
  hours: string;
}

export const PICKUP_POINTS: PickupPoint[] = [
  { region: 'Arica y Parinacota', comuna: 'Arica', name: 'Punto Blue Express Jk', address: 'Pasaje 3 Norte 115, Villa Altos Del Mar, Arica', hours: 'Lun-vie 10:00-20:00' },
  { region: 'Arica y Parinacota', comuna: 'Arica', name: 'Punto Blue Express Donde Junior', address: '18 De Septiembre 575, Arica', hours: 'Lun-vie y sáb 07:30-15:00' },
  { region: 'Arica y Parinacota', comuna: 'Arica', name: 'Punto Blue Express Almacén Jovanny', address: 'Pasaje 7 3368, Población Flor Del Inca, Arica', hours: 'Todos los días 08:30-22:30' },
  { region: 'Arica y Parinacota', comuna: 'Arica', name: 'Punto Blue Express Librería Aramont', address: 'Carlos Tello 1584, Arica', hours: 'Lun-dom (horario extendido)' },
  { region: 'Coquimbo', comuna: 'Coquimbo', name: 'Punto Blue Express Day Mat', address: 'Ricardo Rivera 2546, Coquimbo', hours: 'Todos los días 09:00-22:00' },
  { region: 'Coquimbo', comuna: 'Coquimbo', name: 'Punto Blue Express Sublime Estampado', address: 'Los Tulipanes 171, Coquimbo', hours: 'Todos los días 09:00-19:00' },
  { region: 'Coquimbo', comuna: 'Coquimbo', name: 'Punto Blue Express La Nueva Esquina', address: 'Los Pimientos 500, Coquimbo', hours: 'Todos los días 09:30-20:00' },
  { region: 'Coquimbo', comuna: 'Coquimbo', name: 'Punto Blue Express Almacén Sabary', address: 'Calle Nueva Cinco 1479, Coquimbo', hours: 'Lun-vie 10:00-20:00' },
  { region: 'Coquimbo', comuna: 'Coquimbo', name: 'Punto Blue Express La Cantera Market', address: 'Obpo. D. Rodrigo González 3320, Coquimbo', hours: 'Lun-dom 10:00-21:00' },
  { region: 'Valparaíso', comuna: 'Valparaíso', name: 'Punto Blue Express Don Facu', address: 'Cardenal Samoré 3135, Placilla, Valparaíso', hours: 'Lun-sáb 10:00-21:30' },
  { region: 'Valparaíso', comuna: 'Valparaíso', name: 'Punto Blue Express Santa Teresa', address: 'Playa Ancha 797, Valparaíso', hours: 'Lun-sáb 09:30-19:00 (con pausa)' },
  { region: 'Valparaíso', comuna: 'Valparaíso', name: 'Punto Blue Express El Sureño', address: 'Serrano 325, Valparaíso', hours: 'Lun-dom 09:00-20:00' },
  { region: 'Valparaíso', comuna: 'Valparaíso', name: 'Punto Blue Express Tumi', address: 'Placeres 543, Valparaíso', hours: 'Lun-vie 10:00-16:30' },
  { region: 'Metropolitana de Santiago', comuna: 'Santiago', name: 'Punto Blue Express Botánica Seeds', address: 'Huérfanos 903, Local 953, Santiago', hours: 'Lun-vie 09:00-18:00' },
  { region: 'Metropolitana de Santiago', comuna: 'Santiago', name: 'Punto Blue Express Bazar Tami & Juan', address: 'Franklin 1010, Local 9, Santiago', hours: 'Lun-vie 10:00-17:00' },
  { region: 'Metropolitana de Santiago', comuna: 'Santiago', name: 'Punto Blue Express Mi Ángel', address: 'Claudio Gay 2859, Santiago', hours: 'Lun-dom 08:00-23:00' },
  { region: 'Metropolitana de Santiago', comuna: 'Santiago', name: 'Punto Blue Express La Otra Esquina', address: 'Huérfanos 2401, Santiago', hours: 'Lun-sáb 09:30-20:30' },
  { region: 'Metropolitana de Santiago', comuna: 'Santiago', name: 'Punto Blue Express Tío Ale', address: 'José Miguel Carrera 208, Local 5, Santiago', hours: 'Lun-vie 10:00-17:00' },
  { region: 'Metropolitana de Santiago', comuna: 'Santiago', name: 'Punto Blue Express Cyber Don Francis', address: 'Tarapacá 722, Santiago', hours: 'Lun-vie 12:00-19:00' },
  { region: 'Metropolitana de Santiago', comuna: 'Santiago', name: 'Punto Blue Express Donde la Vivi', address: 'Yungay 2369, Santiago', hours: 'Lun-dom 09:00-21:00' },
  { region: 'Biobío', comuna: 'Concepción', name: 'Punto Blue Express Don Vitoco', address: 'Freire 27, Concepción', hours: 'Lun-sáb 09:00-20:00' },
  { region: 'Biobío', comuna: 'Concepción', name: 'Punto Blue Express Burbujas Market', address: 'Freire 1053, Concepción', hours: 'Lun-vie 09:00-17:00' },
  { region: 'Biobío', comuna: 'Concepción', name: 'Punto Blue Express Detergentes God', address: 'Juan Martínez de Rozas 699, Local 1, Concepción', hours: 'Lun-sáb 09:00-18:30' },
  { region: 'Biobío', comuna: 'Concepción', name: 'Punto Blue Express Carli Cosas Concepción', address: 'Freire 522, Galería Caracol, Local 181, Concepción', hours: 'Lun-sáb 11:00-19:00' },
  { region: 'La Araucanía', comuna: 'Temuco', name: 'Punto Blue Express Librería Progreso', address: 'Claro Solar 573, Temuco', hours: 'Lun-vie 10:00-19:30' },
  { region: 'La Araucanía', comuna: 'Temuco', name: 'Punto Blue Express Minimarket San Ignacio', address: 'Altamira 2301, Temuco', hours: 'Lun-dom 09:00-16:00' },
  { region: 'La Araucanía', comuna: 'Temuco', name: 'Punto Blue Express Provisiones Del Maipo', address: 'Avda. Portal Del Maipo 137, Local 1, Temuco', hours: 'Lun-dom (horario variable)' },
  { region: 'La Araucanía', comuna: 'Temuco', name: 'Punto Blue Express San Nicolás', address: 'Arauco 1384, Temuco', hours: 'Lun-sáb 09:30-20:00' },
  { region: 'Los Lagos', comuna: 'Puerto Montt', name: 'Punto Blue Express Gmr', address: 'Miraflores 1402, Puerto Montt', hours: 'Lun-vie 09:00-18:00' },
  { region: 'Los Lagos', comuna: 'Puerto Montt', name: 'Punto Blue Express Propiedades Cordillera', address: 'Serrano 137, Puerto Montt', hours: 'Lun-vie 09:30-17:30 (cerrado miércoles)' },
  { region: 'Los Lagos', comuna: 'Puerto Montt', name: 'Punto Blue Express Grettel', address: 'Chilca 1013, Puerto Montt', hours: 'Lun-vie 10:00-19:00' },
  { region: 'Los Lagos', comuna: 'Puerto Montt', name: 'Punto Blue Express Sat Nam', address: 'Cuarta Terraza 5001, Local 10, Puerto Montt', hours: 'Lun-sáb 10:00-19:30' },
  { region: 'Aysén del Gral. Carlos Ibáñez del Campo', comuna: 'Aysén', name: 'Punto Blue Express Tienda Rayén Antonia', address: 'Sargento Aldea 1333, Aysén', hours: 'Lun-dom 10:30-19:30' },
  { region: 'Magallanes y de la Antártica Chilena', comuna: 'Punta Arenas', name: 'Punto Blue Express Los Cariñositos', address: 'Martínez De Aldunate 1425, Punta Arenas', hours: 'Lun-sáb 09:00-13:00 / 15:00-20:00' },
  { region: 'Magallanes y de la Antártica Chilena', comuna: 'Punta Arenas', name: 'Punto Blue Express Amelie Creaciones', address: 'Los Salesianos 817, Punta Arenas', hours: 'Lun-sáb 10:00-13:00 / 15:00-21:00' },
  { region: 'Magallanes y de la Antártica Chilena', comuna: 'Punta Arenas', name: 'Punto Blue Express Almacén Donde Kika', address: 'José Martínez De Aldunate 3235, Punta Arenas', hours: 'Lun-dom 08:30-22:00' }
];
