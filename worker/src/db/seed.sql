-- OHCS Office Structure Seed Data
-- Building layout: Ground Floor, 1st Floor, 2nd Floor
-- Directors' personal offices are on 2nd Floor; main directorate offices on 1st Floor
-- Ground Floor: support units (Registry, RCU, Estate, Accounts, F&A, Kitchenette)

-- Executive Offices (2nd Floor)
INSERT OR IGNORE INTO offices (abbreviation, full_name, office_type, floor, room, head_officer, head_officer_title) VALUES
  ('HOC', 'Head of Civil Service',    'executive', '2nd Floor', NULL, 'Head of Civil Service', 'Head of Civil Service'),
  ('CD',  'Office of Chief Director', 'executive', '2nd Floor', NULL, 'Chief Director',        'Chief Director');

-- Directorates (main offices on 1st Floor, directors on 2nd Floor)
INSERT OR IGNORE INTO offices (abbreviation, full_name, office_type, floor, room, head_officer, head_officer_title) VALUES
  ('CMD',   'Career Management Directorate',                                     'directorate', '1st Floor', '33, 34',     'Director CMD',   'Director'),
  ('F&A',   'Finance & Administration Directorate',                              'directorate', '1st Floor', '35',          'Director F&A',   'Director'),
  ('PBMED', 'Planning, Budgeting, Monitoring & Evaluation Directorate',          'directorate', '1st Floor', '30, 31, 32', 'Director PBMED', 'Director'),
  ('RSIMD', 'Research, Statistics & Information Management Directorate',          'directorate', '1st Floor', '19, 20, 21', 'Director RSIMD', 'Director'),
  ('RTDD',  'Recruitment, Training & Development Directorate',                   'directorate', '1st Floor', '36',          'Director RTDD',  'Director');

-- Units
INSERT OR IGNORE INTO offices (abbreviation, full_name, office_type, floor, room, head_officer, head_officer_title) VALUES
  ('RCU',    'Reform Coordinating Unit',     'unit', 'Ground Floor', NULL,          'Head of RCU',         'Head'),
  ('CSC',    'Civil Service Council',        'unit', '1st Floor',    '22, 23, 24',  'Head of CSC',         'Head'),
  ('EPS',    'Estate, Procurement & Stores', 'unit', 'Annex',        NULL,          'Head of EPS',         'Head'),
  ('CU',     'Counseling Unit',              'unit', 'Annex',        NULL,          'Head of Counseling',   'Head'),
  ('AU',     'Audit Unit',                   'unit', 'Annex',        NULL,          'Head of Audit',        'Head'),
  ('PR',     'Public Relations',             'unit', 'Ground Floor', NULL,          'Head of PR',           'Head');

-- Badge Pool (A-01 through E-25 = 125 badges)
INSERT OR IGNORE INTO badges (id, is_available) VALUES
  ('A-01',1),('A-02',1),('A-03',1),('A-04',1),('A-05',1),('A-06',1),('A-07',1),('A-08',1),('A-09',1),('A-10',1),
  ('A-11',1),('A-12',1),('A-13',1),('A-14',1),('A-15',1),('A-16',1),('A-17',1),('A-18',1),('A-19',1),('A-20',1),
  ('A-21',1),('A-22',1),('A-23',1),('A-24',1),('A-25',1),
  ('B-01',1),('B-02',1),('B-03',1),('B-04',1),('B-05',1),('B-06',1),('B-07',1),('B-08',1),('B-09',1),('B-10',1),
  ('B-11',1),('B-12',1),('B-13',1),('B-14',1),('B-15',1),('B-16',1),('B-17',1),('B-18',1),('B-19',1),('B-20',1),
  ('B-21',1),('B-22',1),('B-23',1),('B-24',1),('B-25',1),
  ('C-01',1),('C-02',1),('C-03',1),('C-04',1),('C-05',1),('C-06',1),('C-07',1),('C-08',1),('C-09',1),('C-10',1),
  ('C-11',1),('C-12',1),('C-13',1),('C-14',1),('C-15',1),('C-16',1),('C-17',1),('C-18',1),('C-19',1),('C-20',1),
  ('C-21',1),('C-22',1),('C-23',1),('C-24',1),('C-25',1),
  ('D-01',1),('D-02',1),('D-03',1),('D-04',1),('D-05',1),('D-06',1),('D-07',1),('D-08',1),('D-09',1),('D-10',1),
  ('D-11',1),('D-12',1),('D-13',1),('D-14',1),('D-15',1),('D-16',1),('D-17',1),('D-18',1),('D-19',1),('D-20',1),
  ('D-21',1),('D-22',1),('D-23',1),('D-24',1),('D-25',1),
  ('E-01',1),('E-02',1),('E-03',1),('E-04',1),('E-05',1),('E-06',1),('E-07',1),('E-08',1),('E-09',1),('E-10',1),
  ('E-11',1),('E-12',1),('E-13',1),('E-14',1),('E-15',1),('E-16',1),('E-17',1),('E-18',1),('E-19',1),('E-20',1),
  ('E-21',1),('E-22',1),('E-23',1),('E-24',1),('E-25',1);
