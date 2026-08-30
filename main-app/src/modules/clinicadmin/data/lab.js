// Mock data + constants for the lab feature.

export const labTests = ['Hematology', 'Biochemistry', 'Micro-Biology', 'Cytology', 'Histopathology', 'Radiology', 'PCR'];
export const labShifts = ['Morning', 'Afternoon', 'Evening', '24 Hours'];

export const labStaff = [
  { id: 'LAB001', name: 'Rahul Mehta', initials: 'RM', color: '#22C55E', qualification: 'B.Sc. MLT', experience: 5, specializedTests: ['Hematology', 'Biochemistry'], shift: 'Morning', status: 'Active' },
  { id: 'LAB002', name: 'Pooja Singh', initials: 'PS', color: '#06B6D4', qualification: 'Diploma in MLT', experience: 3, specializedTests: ['Cytology', 'PCR'], shift: 'Afternoon', status: 'Active' },
  { id: 'LAB003', name: 'Kiran Bhat', initials: 'KB', color: '#F59E0B', qualification: 'M.Sc. Microbiology', experience: 7, specializedTests: ['Micro-Biology', 'Histopathology'], shift: 'Morning', status: 'Active' },
  { id: 'LAB004', name: 'Sneha Reddy', initials: 'SR', color: '#A855F7', qualification: 'B.Sc. MLT', experience: 2, specializedTests: ['Radiology'], shift: 'Evening', status: 'Inactive' },
];
