-- Seed data for benefits catalog

insert into public.benefits (name, description, category, price, image_url, merchant, is_active) values
  ('Gym Pass', 'Acceso mensual al gimnasio partner. Incluye todas las clases y equipamiento.', 'Salud', 15, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=200&fit=crop', 'SportClub', true),
  ('Coursera', 'Acceso a un curso completo de tu eleccion en Coursera. Certificado incluido.', 'Educacion', 12, 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=300&h=200&fit=crop', 'Coursera', true),
  ('Starbucks', 'Gift card para consumir en cualquier local Starbucks. Valido por 60 dias.', 'Gastronomia', 5, 'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&h=200&fit=crop', 'Starbucks', true),
  ('Netflix', 'Un mes de suscripcion Netflix Standard. Activa cuando quieras.', 'Entretenimiento', 8, 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=300&h=200&fit=crop', 'Netflix', true),
  ('Headspace', 'Suscripcion anual a Headspace para meditacion y mindfulness.', 'Bienestar', 10, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=200&fit=crop', 'Headspace', true),
  ('PedidosYa', 'Credito para usar en PedidosYa. Sin minimo de compra.', 'Gastronomia', 7, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop', 'PedidosYa', true),
  ('Spotify Premium', 'Tres meses de Spotify Premium. Musica sin anuncios.', 'Entretenimiento', 6, 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=300&h=200&fit=crop', 'Spotify', true),
  ('Yoga Pass', 'Pack de 8 clases de yoga en estudios asociados.', 'Bienestar', 12, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop', 'YogaStudio', true),
  ('Udemy Course', 'Un curso de tu eleccion en Udemy. Acceso de por vida.', 'Educacion', 8, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop', 'Udemy', true),
  ('Coffee Shop', 'Credito para cafeterias locales. Valido en red de partners.', 'Gastronomia', 4, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop', 'Local Coffee', true),
  ('Cinema Pass', 'Dos entradas de cine en Hoyts o Cinemark. 2D o 3D.', 'Entretenimiento', 9, 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=200&fit=crop', 'Hoyts', true),
  ('Therapy Session', 'Una sesion de terapia online con profesionales certificados.', 'Salud', 18, 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=200&fit=crop', 'BetterHelp', true)
on conflict do nothing;
