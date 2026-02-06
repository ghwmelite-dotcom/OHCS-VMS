export const OFFICE_TYPES = {
  DIRECTORATE: 'directorate',
  UNIT: 'unit',
  EXECUTIVE: 'executive',
};

export const OFFICE_TYPE_COLORS = {
  directorate: { bg: 'bg-ghana-green/15', text: 'text-ghana-green', border: 'border-ghana-green/30', hex: '#006B3F' },
  unit: { bg: 'bg-accent-blue/15', text: 'text-accent-blue', border: 'border-accent-blue/30', hex: '#3B82F6' },
  executive: { bg: 'bg-ghana-gold/15', text: 'text-ghana-gold', border: 'border-ghana-gold/30', hex: '#FCD116' },
};

export const OFFICE_TYPE_ICONS = {
  directorate: '\u{1F3DB}\u{FE0F}',
  unit: '\u{1F527}',
  executive: '\u{2B50}',
};

export const OFFICE_TYPE_LABELS = {
  directorate: 'Directorate',
  unit: 'Unit',
  executive: 'Executive',
};

export const VISIT_PURPOSES = [
  'Official Meeting',
  'Document Submission',
  'Document Collection',
  'Consultation',
  'Training/Workshop',
  'Courtesy Call',
  'Audit Review',
  'Complaint/Inquiry',
  'Interview',
  'Service Request',
  'Other',
];

export const ID_TYPES = [
  'Ghana Card',
  'Passport',
  'Voter ID',
  "Driver's License",
];

export const STATUS_COLORS = {
  'checked-in': { bg: 'bg-ghana-green/15', text: 'text-ghana-green', border: 'border-ghana-green/30', label: 'Checked In' },
  'checked-out': { bg: 'bg-text-secondary/15', text: 'text-text-secondary', border: 'border-text-secondary/30', label: 'Checked Out' },
  'pre-registered': { bg: 'bg-ghana-gold/15', text: 'text-ghana-gold', border: 'border-ghana-gold/30', label: 'Pre-Registered' },
};
