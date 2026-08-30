// Mock data + constants for the groomer feature.

export const species = ['Dogs', 'Cats', 'Small Animals', 'Birds', 'Exotic'];
export const groomingServices = ['Bath & Dry', 'Hair Trim', 'Nail Clipping', 'Ear Cleaning', 'Dental Cleaning', 'De-shedding', 'Styling'];
export const certTypes = ['Certificate', 'Diploma', 'Year'];
export const shifts = ['Full Day', 'Half Day', 'Weekends'];

export const groomers = [
  { id: 'GRM001', name: 'Sunita Rao', initials: 'SR', color: '#A855F7', experience: 4, species: ['Dogs', 'Cats'], services: ['Bath & Dry', 'Hair Trim', 'Styling'], shift: 'Full Day', certified: true, status: 'Active' },
  { id: 'GRM002', name: 'Raj Kumar', initials: 'RK', color: '#EC4899', experience: 6, species: ['Dogs', 'Small Animals', 'Exotic'], services: ['Bath & Dry', 'Nail Clipping', 'De-shedding'], shift: 'Weekends', certified: true, status: 'Active' },
  { id: 'GRM003', name: 'Meena Pillai', initials: 'MP', color: '#F59E0B', experience: 2, species: ['Cats', 'Birds'], services: ['Bath & Dry', 'Ear Cleaning'], shift: 'Half Day', certified: false, status: 'Active' },
];
