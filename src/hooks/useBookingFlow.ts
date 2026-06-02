import { useState, useEffect } from 'react';
import type { Business, Service, Employee } from '../types';
import { getServices, getEmployees } from '../services/firebase/businesses';
import { createBooking } from '../services/firebase/bookings';
import { generateTimeSlots } from '../utils/helpers';

export type BookingStep = 'service' | 'employee' | 'datetime' | 'details' | 'confirmed';

export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

export interface BookingFlowState {
  step: BookingStep;
  services: Service[];
  employees: Employee[];
  selectedService: Service | null;
  selectedEmployee: Employee | null;
  selectedDate: string;
  selectedTime: string;
  timeSlots: string[];
  form: BookingFormData;
  loading: boolean;
  submitting: boolean;
  bookingId: string | null;
  error: string | null;
}

const EMPTY_FORM: BookingFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  notes: '',
};

export function useBookingFlow(business: Business) {
  const [state, setState] = useState<BookingFlowState>({
    step: 'service',
    services: [],
    employees: [],
    selectedService: null,
    selectedEmployee: null,
    selectedDate: '',
    selectedTime: '',
    timeSlots: [],
    form: EMPTY_FORM,
    loading: true,
    submitting: false,
    bookingId: null,
    error: null,
  });

  useEffect(() => {
    Promise.all([
      getServices(business.id),
      getEmployees(business.id),
    ]).then(([services, employees]) => {
      setState(s => ({
        ...s,
        services: services.filter(s => s.isActive),
        employees: employees.filter(e => e.isActive),
        loading: false,
      }));
    }).catch(() => {
      setState(s => ({ ...s, loading: false, error: 'Daten konnten nicht geladen werden.' }));
    });
  }, [business.id]);

  useEffect(() => {
    if (!state.selectedService || !state.selectedDate) return;

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayNames[new Date(state.selectedDate).getDay()] as keyof typeof business.openingHours;
    const hours = business.openingHours[dayKey];
    if (!hours.isOpen) {
      setState(s => ({ ...s, timeSlots: [] }));
      return;
    }
    const slots = generateTimeSlots(hours.start, hours.end, state.selectedService.duration);
    setState(s => ({ ...s, timeSlots: slots, selectedTime: '' }));
  }, [state.selectedDate, state.selectedService, business.openingHours]);

  function selectService(service: Service) {
    setState(s => ({ ...s, selectedService: service, selectedEmployee: null, selectedDate: '', selectedTime: '', step: 'employee' }));
  }

  function selectEmployee(employee: Employee | null) {
    setState(s => ({ ...s, selectedEmployee: employee, step: 'datetime' }));
  }

  function selectDate(date: string) {
    setState(s => ({ ...s, selectedDate: date, selectedTime: '' }));
  }

  function selectTime(time: string) {
    setState(s => ({ ...s, selectedTime: time, step: 'details' }));
  }

  function updateForm(field: keyof BookingFormData, value: string) {
    setState(s => ({ ...s, form: { ...s.form, [field]: value } }));
  }

  function goToStep(step: BookingStep) {
    setState(s => ({ ...s, step }));
  }

  async function submitBooking() {
    const { selectedService, selectedEmployee, selectedDate, selectedTime, form } = state;
    if (!selectedService || !selectedDate || !selectedTime) return;

    setState(s => ({ ...s, submitting: true, error: null }));

    try {
      const [h, m] = selectedTime.split(':').map(Number);
      const start = new Date(selectedDate);
      start.setHours(h, m, 0, 0);
      const end = new Date(start.getTime() + selectedService.duration * 60000);

      const booking = await createBooking({
        businessId: business.id,
        customerName: `${form.firstName} ${form.lastName}`.trim(),
        customerEmail: form.email,
        customerPhone: form.phone,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        serviceDuration: selectedService.duration,
        servicePrice: selectedService.price,
        employeeId: selectedEmployee?.id,
        employeeName: selectedEmployee?.name,
        startTime: start,
        endTime: end,
        status: 'pending',
        paymentMethod: 'onsite',
        paymentStatus: 'pending',
        totalAmount: selectedService.price,
        notes: form.notes,
      });

      setState(s => ({ ...s, bookingId: booking.id, step: 'confirmed', submitting: false }));
    } catch {
      setState(s => ({ ...s, submitting: false, error: 'Buchung fehlgeschlagen. Bitte versuche es erneut.' }));
    }
  }

  return {
    ...state,
    selectService,
    selectEmployee,
    selectDate,
    selectTime,
    updateForm,
    goToStep,
    submitBooking,
  };
}
