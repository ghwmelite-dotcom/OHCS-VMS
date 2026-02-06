import { Office } from '../types';

export function getOfficeTypeColor(type: string): string {
  switch (type) {
    case 'directorate': return '#006B3F';
    case 'unit': return '#3B82F6';
    case 'executive': return '#FCD116';
    default: return '#94A3B8';
  }
}

export function getOfficeTypeIcon(type: string): string {
  switch (type) {
    case 'directorate': return '\u{1F3DB}\u{FE0F}'; // 🏛️
    case 'unit': return '\u{1F527}'; // 🔧
    case 'executive': return '\u{2B50}'; // ⭐
    default: return '';
  }
}

export function groupOfficesByType(offices: Office[]): {
  executive: Office[];
  directorates: Office[];
  units: Office[];
} {
  return {
    executive: offices.filter(o => o.office_type === 'executive'),
    directorates: offices.filter(o => o.office_type === 'directorate'),
    units: offices.filter(o => o.office_type === 'unit'),
  };
}
