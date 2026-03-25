-- Seed data for demo

INSERT INTO users (telegram_id, username, first_name, last_name, is_admin) VALUES
(100001, 'admin_user', 'Admin', 'User', TRUE),
(100002, 'aziz_dev', 'Aziz', 'Karimov', FALSE),
(100003, 'dilnoza_t', 'Dilnoza', 'Toshmatova', FALSE),
(100004, 'jasur_m', 'Jasur', 'Mirzayev', FALSE),
(100005, 'nodira_s', 'Nodira', 'Saidova', FALSE)
ON CONFLICT (telegram_id) DO NOTHING;

INSERT INTO problems (user_id, title, description, category, sentiment, urgency, keywords, lat, lng, vote_count) VALUES
(2, 'Chilonzorda yo''l chuqurlari', 'Chilonzor 9-kvartalda asosiy ko''chada katta chuqurlar bor. Mashinalar buzilmoqda va odamlar yiqilmoqda.', 'infrastructure', 'negative', 5, ARRAY['yo''l', 'chuqur', 'chilonzor', 'xavfli'], 41.2861, 69.2044, 24),
(3, 'Maktabda internet yo''q', 'Sergeli tumanidagi 145-maktabda 3 oydan beri internet ishlamayapti. Bolalar online darslarni o''tkazolmayapti.', 'education', 'negative', 4, ARRAY['maktab', 'internet', 'ta''lim', 'sergeli'], 41.2275, 69.2800, 18),
(4, 'Parkdagi chiroqlar ishlamaydi', 'Toshkent City yaqinidagi parkda tungi chiroqlar 2 haftadan beri o''chirilgan. Xavfsizlik muammosi.', 'safety', 'negative', 4, ARRAY['park', 'chiroq', 'xavfsizlik', 'tun'], 41.3111, 69.2797, 31),
(5, 'Metro stantsiyasida lift buzilgan', 'Minor metro stantsiyasidagi lift 1 oydan beri ishlamayapti. Nogironlar va keksalar foydalana olmaydi.', 'transport', 'negative', 5, ARRAY['metro', 'lift', 'nogiron', 'minor'], 41.3226, 69.2689, 42),
(2, 'Poliklinikada navbat juda uzun', 'Olmazor tumani poliklinikasida navbat 4-5 soat. Online navbat tizimi ishlamaydi.', 'healthcare', 'negative', 4, ARRAY['poliklinika', 'navbat', 'sog''liqni saqlash'], 41.3380, 69.2190, 15),
(3, 'Ariq suvi ko''chaga oqmoqda', 'Yunusobod tumanida ariq suvi ko''chaga oqib chiqmoqda. Hid va kasallik tarqalishi xavfi bor.', 'environment', 'urgent', 5, ARRAY['ariq', 'suv', 'ifloslanish', 'yunusobod'], 41.3540, 69.2860, 27),
(4, 'Yangi avtobus yo''nalishi kerak', 'Sergeli tumanidan Toshkent shahri markaziga to''g''ridan-to''g''ri avtobus yo''q. Odamlar 2 marta almashish kerak.', 'transport', 'negative', 3, ARRAY['avtobus', 'transport', 'sergeli', 'marshrut'], 41.2275, 69.2800, 12),
(5, 'IT kurslar yetishmaydi', 'Olmazor tumanida yoshlar uchun bepul IT kurslar juda kam. Ko''p yoshlar imkoniyatsiz qolmoqda.', 'education', 'negative', 3, ARRAY['IT', 'kurs', 'yoshlar', 'ta''lim'], 41.3380, 69.2190, 9),
(2, 'Bolalar maydonchasiga ehtiyoj', 'Mirzo Ulug''bek tumanida yangi qurilgan uylar yonida bolalar maydonchalari yo''q.', 'social', 'negative', 3, ARRAY['bolalar', 'maydoncha', 'turar-joy'], 41.3400, 69.3350, 20),
(3, 'Elektr ta''minoti uzilishi', 'Yakkasaroy tumanida haftada 2-3 marta elektr uziladi. Sovutgichdagi mahsulotlar buzilmoqda.', 'infrastructure', 'negative', 4, ARRAY['elektr', 'uzilish', 'yakkasaroy'], 41.2960, 69.2730, 35);

-- Add some votes
INSERT INTO votes (user_id, problem_id) VALUES
(2, 3), (2, 4), (2, 6),
(3, 1), (3, 4), (3, 5),
(4, 1), (4, 2), (4, 6),
(5, 1), (5, 3), (5, 4)
ON CONFLICT DO NOTHING;
