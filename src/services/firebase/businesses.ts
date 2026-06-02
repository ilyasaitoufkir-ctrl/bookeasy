import {
  collection, doc, setDoc, getDoc, getDocs,
  updateDoc, query, where, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import type { Business, Service, Employee, OpeningHours } from '../../types';
import { slugify } from '../../utils/helpers';

const DEFAULT_HOURS: OpeningHours = {
  monday:    { isOpen: true,  start: '09:00', end: '18:00' },
  tuesday:   { isOpen: true,  start: '09:00', end: '18:00' },
  wednesday: { isOpen: true,  start: '09:00', end: '18:00' },
  thursday:  { isOpen: true,  start: '09:00', end: '18:00' },
  friday:    { isOpen: true,  start: '09:00', end: '17:00' },
  saturday:  { isOpen: false, start: '10:00', end: '14:00' },
  sunday:    { isOpen: false, start: '10:00', end: '14:00' },
};

export async function createBusiness(ownerId: string, data: Partial<Business>): Promise<Business> {
  const id = doc(collection(db, 'businesses')).id;
  const slug = slugify(data.name || 'business');
  const business: Omit<Business, 'createdAt'> & { createdAt: unknown } = {
    id,
    ownerId,
    name: data.name || '',
    slug,
    description: data.description || '',
    primaryColor: data.primaryColor || '#1e3a5f',
    secondaryColor: data.secondaryColor || '#3068bc',
    phone: data.phone || '',
    email: data.email || '',
    address: data.address || '',
    city: data.city || '',
    category: data.category || 'Sonstiges',
    openingHours: data.openingHours || DEFAULT_HOURS,
    plan: 'free',
    monthlyBookingCount: 0,
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(db, 'businesses', id), business);
  return { ...business, createdAt: new Date() } as Business;
}

export async function getBusinessByOwner(ownerId: string): Promise<Business | null> {
  const q = query(collection(db, 'businesses'), where('ownerId', '==', ownerId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return convertBusiness(snap.docs[0].data() as Business);
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const q = query(collection(db, 'businesses'), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return convertBusiness(snap.docs[0].data() as Business);
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const snap = await getDoc(doc(db, 'businesses', id));
  if (!snap.exists()) return null;
  return convertBusiness(snap.data() as Business);
}

export async function searchBusinesses(query_str: string, category?: string): Promise<Business[]> {
  let q = query(collection(db, 'businesses'), orderBy('name'));
  const snap = await getDocs(q);
  const all = snap.docs.map(d => convertBusiness(d.data() as Business));
  return all.filter(b => {
    const matchesSearch = !query_str || b.name.toLowerCase().includes(query_str.toLowerCase()) || b.city.toLowerCase().includes(query_str.toLowerCase());
    const matchesCategory = !category || b.category === category;
    return matchesSearch && matchesCategory;
  });
}

export async function getAllBusinesses(): Promise<Business[]> {
  const snap = await getDocs(collection(db, 'businesses'));
  return snap.docs.map(d => convertBusiness(d.data() as Business));
}

export async function updateBusiness(id: string, data: Partial<Business>): Promise<void> {
  await updateDoc(doc(db, 'businesses', id), { ...data });
}

export async function uploadBusinessLogo(businessId: string, file: File): Promise<string> {
  const storageRef = ref(storage, `businesses/${businessId}/logo`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

function convertBusiness(data: Business): Business {
  return {
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
  };
}

// Services
export async function getServices(businessId: string): Promise<Service[]> {
  const q = query(collection(db, 'services'), where('businessId', '==', businessId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Service);
}

export async function saveService(service: Partial<Service> & { businessId: string }): Promise<Service> {
  const id = service.id || doc(collection(db, 'services')).id;
  const data = { ...service, id };
  await setDoc(doc(db, 'services', id), data);
  return data as Service;
}

export async function deleteService(id: string): Promise<void> {
  await updateDoc(doc(db, 'services', id), { isActive: false });
}

// Employees
export async function getEmployees(businessId: string): Promise<Employee[]> {
  const q = query(collection(db, 'employees'), where('businessId', '==', businessId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Employee);
}

export async function saveEmployee(employee: Partial<Employee> & { businessId: string }): Promise<Employee> {
  const id = employee.id || doc(collection(db, 'employees')).id;
  const data = { ...employee, id, workingHours: employee.workingHours || DEFAULT_HOURS };
  await setDoc(doc(db, 'employees', id), data);
  return data as Employee;
}

export async function deleteEmployee(id: string): Promise<void> {
  await updateDoc(doc(db, 'employees', id), { isActive: false });
}
