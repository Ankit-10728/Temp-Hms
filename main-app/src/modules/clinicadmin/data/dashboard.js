// Mock data + constants for the dashboard feature.

export const revenueData = [
  { month: 'Jan', revenue: 85000 }, { month: 'Feb', revenue: 92000 },
  { month: 'Mar', revenue: 78000 }, { month: 'Apr', revenue: 105000 },
  { month: 'May', revenue: 98000 }, { month: 'Jun', revenue: 120000 },
];

export const apptData = [
  { day: 'Mon', appts: 28 }, { day: 'Tue', appts: 35 },
  { day: 'Wed', appts: 22 }, { day: 'Thu', appts: 40 },
  { day: 'Fri', appts: 34 }, { day: 'Sat', appts: 18 }, { day: 'Sun', appts: 12 },
];

export const recentEnrollments = [
  { initials: 'DP', name: 'Dr. Priya Sharma', role: 'Doctor', dept: 'OPD', status: 'Active', color: '#6366F1' },
  { initials: 'RM', name: 'Rahul Mehta', role: 'Lab Technician', dept: 'Lab', status: 'Active', color: '#22C55E' },
  { initials: 'SR', name: 'Sunita Rao', role: 'Groomer', dept: 'Grooming', status: 'Active', color: '#A855F7' },
  { initials: 'AV', name: 'Amit Verma', role: 'Kennel Staff', dept: 'Kennel', status: 'Active', color: '#F97316' },
  { initials: 'NK', name: 'Neha Kapoor', role: 'Receptionist', dept: 'Front Desk', status: 'Active', color: '#EC4899' },
];

export const roleDistribution = [
  { role: 'Doctor', count: 9, total: 28, color: '#6366F1' },
  { role: 'Lab Technician', count: 4, total: 28, color: '#22C55E' },
  { role: 'Groomer', count: 5, total: 28, color: '#A855F7' },
  { role: 'Kennel Staff', count: 6, total: 28, color: '#F97316' },
  { role: 'Receptionist', count: 4, total: 28, color: '#EC4899' },
];

export const todayAppts = [
  { time: '09:00', pet: 'Buddy (Golden Retriever)', owner: 'Rohan Desai', doctor: 'Dr. Priya Sharma', type: 'Checkup', status: 'Confirmed' },
  { time: '09:30', pet: 'Whiskers (Persian Cat)', owner: 'Meera Joshi', doctor: 'Dr. Arjun Nair', type: 'Vaccination', status: 'Confirmed' },
  { time: '10:00', pet: 'Max (Labrador)', owner: 'Sanjay Gupta', doctor: 'Dr. Priya Sharma', type: 'Surgery', status: 'In Progress' },
  { time: '11:00', pet: 'Coco (Poodle)', owner: 'Anita Shah', doctor: 'Dr. Kavitha Rao', type: 'Grooming', status: 'Pending' },
  { time: '11:30', pet: 'Rocky (German Shepherd)', owner: 'Vijay Kumar', doctor: 'Dr. Arjun Nair', type: 'Checkup', status: 'Confirmed' },
];
