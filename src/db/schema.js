export const INIT_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'guest',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hosts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  languages TEXT NOT NULL,
  activity TEXT NOT NULL,
  rate REAL NOT NULL,
  rating REAL NOT NULL DEFAULT 5.0,
  review_count INTEGER NOT NULL DEFAULT 0,
  bio TEXT,
  whats_included TEXT,
  photo_color TEXT DEFAULT '#C0DD97',
  verified INTEGER NOT NULL DEFAULT 0,
  hosting_since INTEGER DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS host_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  host_id INTEGER NOT NULL,
  author_name TEXT NOT NULL,
  author_country TEXT,
  rating REAL NOT NULL DEFAULT 5.0,
  comment TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  host_id INTEGER NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  session_type TEXT,
  booking_date TEXT NULL,
  hours INTEGER NOT NULL DEFAULT 2,
  estimated_total REAL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS host_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  city TEXT,
  languages TEXT,
  phone TEXT,
  about TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

export const SEED_DATA_SQL = `
INSERT INTO users (full_name, email, password_hash, role) VALUES
('Admin User', 'admin@for-local.rw', 'adminpassword', 'admin'),
('Sarah Smith', 'sarah@example.com', 'userpassword', 'guest');

INSERT INTO hosts (name, city, languages, activity, rate, rating, review_count, bio, whats_included, photo_color, verified, hosting_since) VALUES
('Alice U.', 'kigali', 'english,french', 'orientation', 18.00, 4.9, 61,
 'I grew up in Kigali and love showing visitors the city beyond the guidebook — the markets locals actually shop at, the best brochette spot in Nyamirambo, and how to get around without getting lost in translation. I studied English and French at university and have been helping travelers navigate Rwanda for two years.',
 'Full translation support throughout your session
Local etiquette and cultural context as you go
Help with mobile money, SIM cards, or local transport
Honest recommendations — no commission-driven detours',
 '#C0DD97', 1, 2024),
('Eric M.', 'kigali', 'english,kinyarwanda', 'food', 22.00, 5.0, 34,
 'Kigali-born food lover who knows every market stall worth visiting.',
 'Guided market tours
Food tastings with trusted vendors
Translation support
Bargaining help', '#F0997B', 1, 2023),
('Diane K.', 'kigali', 'english,french,swahili', 'business', 25.00, 4.8, 28,
 'I support business travelers with meeting logistics, interpretation, and getting around Kigali efficiently.',
 'Meeting and appointment support
Professional interpretation
Airport and hotel coordination
Local business etiquette guidance', '#85B7EB', 1, 2023),
('Jean Paul N.', 'musanze', 'english', 'fullday', 30.00, 4.9, 19,
 'Based in Musanze, I guide full-day trips around the Volcanoes region.',
 'Full-day itinerary planning
Transport coordination
Translation and local context
Photo stops at the best viewpoints', '#F0A83B', 1, 2024),
('Claudine I.', 'huye', 'english,french', 'orientation', 16.00, 4.7, 12,
 'A Huye local who enjoys introducing visitors to the university town and its history.',
 'City orientation walks
Translation support
Recommendations for food and stays
Historical context', '#AFA9EC', 1, 2024),
('Aime K.', 'kigali', 'english,swahili', 'fullday', 24.00, 4.9, 45,
 'I put together full days in Kigali mixing culture, food, and the city''s best viewpoints.',
 'Full-day custom itinerary
Translation throughout
Mobile money and SIM card help
Honest, no-commission recommendations', '#D4537E', 1, 2023);

INSERT INTO host_reviews (host_id, author_name, author_country, rating, comment) VALUES
(1, 'Sofia', 'Spain', 5.0, 'Alice made our first day in Kigali so much easier. She translated everything at the market and helped us bargain fairly.'),
(1, 'Tom', 'UK', 5.0, 'Genuinely felt like being shown around by a friend. Highly recommend for solo travelers.'),
(2, 'Marcus', 'Germany', 5.0, 'Eric showed us food spots we would never have found on our own. Incredible brochettes and fresh juices!'),
(4, 'Claire', 'Canada', 4.9, 'Jean Paul took care of all volcano trip logistics seamlessly. Super knowledgeable host!');

INSERT INTO bookings (host_id, guest_name, guest_email, session_type, booking_date, hours, estimated_total, status) VALUES
(1, 'David Miller', 'david@example.com', 'City orientation — $18.00/hr', '2026-09-15', 3, 54.00, 'confirmed'),
(2, 'Elena Rostova', 'elena@example.com', 'Markets & food — $22.00/hr', '2026-09-20', 2, 44.00, 'pending');

INSERT INTO host_applications (full_name, city, languages, phone, about, status) VALUES
('Emmanuel K.', 'kigali', 'English, French, Kinyarwanda', '+250 788 123 456', 'I am a university student in Kigali who loves photography and local art galleries.', 'pending');

INSERT INTO contact_messages (name, email, topic, message, status) VALUES
('Rachel Adams', 'rachel@example.com', 'General question', 'Hi, can I book a host for a group of 4 people?', 'new');
`;
