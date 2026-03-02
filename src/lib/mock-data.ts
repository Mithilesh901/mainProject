export const INITIAL_HOSPITALS = [
  {
    id: 'h1',
    name: 'Apollo Health City',
    address: 'Jubilee Hills, Hyderabad',
    location: { lat: 17.4243, lng: 78.4116 },
    traumaAvailable: true,
    cardiologyAvailable: true,
    totalICU: 60,
    availableICU: 18,
    contactNumber: '040-23607777'
  },
  {
    id: 'h2',
    name: 'NIMS (Nizam\'s Institute)',
    address: 'Punjagutta, Hyderabad',
    location: { lat: 17.4216, lng: 78.4552 },
    traumaAvailable: true,
    cardiologyAvailable: false,
    totalICU: 120,
    availableICU: 14,
    contactNumber: '040-23489000'
  },
  {
    id: 'h3',
    name: 'Care Hospitals',
    address: 'Banjara Hills, Hyderabad',
    location: { lat: 17.4124, lng: 78.4485 },
    traumaAvailable: false,
    cardiologyAvailable: true,
    totalICU: 45,
    availableICU: 9,
    contactNumber: '040-61656565'
  }
];

export const INITIAL_AMBULANCES = [
  {
    id: 'a1',
    vehicleNumber: 'TS-09-UA-1234',
    driverName: 'Rajesh Kumar',
    equipment: ['ventilator', 'oxygen', 'traumaKit'],
    status: 'AVAILABLE',
    currentLocation: { lat: 17.4000, lng: 78.4500 },
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'a2',
    vehicleNumber: 'TS-10-UB-5678',
    driverName: 'Mohammed Ahmed',
    equipment: ['oxygen', 'traumaKit'],
    status: 'AVAILABLE',
    currentLocation: { lat: 17.4300, lng: 78.4300 },
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'a3',
    vehicleNumber: 'TS-11-UC-9012',
    driverName: 'Srinivas Rao',
    equipment: ['ventilator', 'oxygen'],
    status: 'AVAILABLE',
    currentLocation: { lat: 17.3800, lng: 78.4800 },
    lastUpdated: new Date().toISOString()
  }
];
