// Mock data + constants for the staff feature.

export const roles = ['Receptionist', 'Pre-consultation Staff', 'Doctor', 'Lab Technician', 'Groomer', 'Kennel Staff', 'Pharmacist'];
export const departments = ['OPD', 'Surgery', 'Lab', 'ICU', 'Grooming', 'Kennel'];
export const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Visiting', 'Locum'];
export const MODULE_OPTIONS = ['opd', 'surgery', 'lab', 'icu', 'grooming', 'kennel', 'pharmacy', 'reports', 'settings'];

export const staffData = [
  { id: 'STF001', name: 'Dr. Priya Sharma', role: 'Doctor', dept: 'OPD', status: 'Active', joined: '2024-01-15', initials: 'DP', color: '#6366F1', employment: 'Full-time' },
  { id: 'STF002', name: 'Rahul Mehta', role: 'Lab Technician', dept: 'Lab', status: 'Active', joined: '2024-02-20', initials: 'RM', color: '#22C55E', employment: 'Full-time' },
  { id: 'STF003', name: 'Sunita Rao', role: 'Groomer', dept: 'Grooming', status: 'Active', joined: '2024-03-10', initials: 'SR', color: '#A855F7', employment: 'Part-time' },
  { id: 'STF004', name: 'Amit Verma', role: 'Kennel Staff', dept: 'Kennel', status: 'Active', joined: '2024-03-22', initials: 'AV', color: '#F97316', employment: 'Full-time' },
  { id: 'STF005', name: 'Neha Kapoor', role: 'Receptionist', dept: 'Front Desk', status: 'Inactive', joined: '2023-11-05', initials: 'NK', color: '#EC4899', employment: 'Contract' },
  { id: 'STF006', name: 'Dr. Arjun Nair', role: 'Doctor', dept: 'Surgery', status: 'Active', joined: '2023-08-18', initials: 'AN', color: '#06B6D4', employment: 'Full-time' },
];
