// Mock data + constants for the kennel feature.

export const kennel_species = ['Dogs', 'Cats', 'Small Animals', 'Birds'];
export const kennel_shifts = ['Day', 'Night', 'Rotating'];

export const kennelStaff = [
  { id: 'KNL001', name: 'Amit Verma', initials: 'AV', color: '#F97316', experience: 3, species: ['Dogs', 'Cats'], shift: 'Day', firstAidCert: true, canMedicate: true, status: 'Active' },
  { id: 'KNL002', name: 'Pradeep Singh', initials: 'PS', color: '#EAB308', experience: 5, species: ['Dogs', 'Small Animals'], shift: 'Night', firstAidCert: false, canMedicate: false, status: 'Active' },
  { id: 'KNL003', name: 'Lakshmi Nair', initials: 'LN', color: '#06B6D4', experience: 2, species: ['Cats', 'Birds'], shift: 'Rotating', firstAidCert: true, canMedicate: true, status: 'Active' },
];
