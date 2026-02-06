-- OHCS Office Structure Seed Data

-- Executive Offices
INSERT OR IGNORE INTO offices (abbreviation, full_name, office_type, floor, room, head_officer, head_officer_title) VALUES
  ('OHCS', 'Office of the Head of Civil Service', 'executive', '3rd Floor', '301', 'Head of Civil Service', 'Head of Civil Service'),
  ('OCD',  'Office of the Chief Director',        'executive', '3rd Floor', '305', 'Chief Director',        'Chief Director');

-- Directorates
INSERT OR IGNORE INTO offices (abbreviation, full_name, office_type, floor, room, head_officer, head_officer_title) VALUES
  ('RTDD',  'Research, Training & Development Directorate',               'directorate', '2nd Floor', '201', 'Director RTDD',  'Director'),
  ('RSIMD', 'Research, Statistics & Information Management Directorate',   'directorate', '1st Floor', '112', 'Director RSIMD', 'Director'),
  ('CMD',   'Change Management Directorate',                               'directorate', '2nd Floor', '210', 'Director CMD',   'Director'),
  ('F&A',   'Finance & Administration Directorate',                        'directorate', '1st Floor', '105', 'Director F&A',   'Director'),
  ('PBMED', 'Policy, Budget, Monitoring & Evaluation Directorate',         'directorate', '2nd Floor', '215', 'Director PBMED', 'Director');

-- Units
INSERT OR IGNORE INTO offices (abbreviation, full_name, office_type, floor, room, head_officer, head_officer_title) VALUES
  ('IAU',    'Internal Audit Unit',           'unit', '1st Floor', '108', 'Head of IAU',    'Head'),
  ('Estate', 'Estate Unit',                   'unit', 'Ground Floor', 'G03', 'Head of Estate', 'Head'),
  ('CSC',    'Client Service Centre',         'unit', 'Ground Floor', 'G01', 'Head of CSC',    'Head'),
  ('RCU',    'Records & Communications Unit', 'unit', 'Ground Floor', 'G05', 'Head of RCU',    'Head');

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
