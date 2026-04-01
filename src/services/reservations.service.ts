import type {
  Reservation,
  ReservationInsert,
  ReservationUpdate,
} from "@/types/reservation";
import type {
  CreateReservationInput,
  UpdateReservationInput,
} from "@/schemas/reservation.schema";
import * as reservationsRepo from "@/repositories/reservations.repository";

// ---------------------------------------------------------------------------
// Service layer — business logic, orchestration, validation rules
// ---------------------------------------------------------------------------

export async function list(): Promise<Reservation[]> {
  return reservationsRepo.findAll();
}

export async function getById(id: string): Promise<Reservation | null> {
  return reservationsRepo.findById(id);
}

/** Check for overlapping reservations on the same property. */
export async function checkOverlap(
  propertyId: string,
  checkIn: string,
  checkOut: string,
  excludeId?: string,
): Promise<Reservation[]> {
  return reservationsRepo.findOverlapping(
    propertyId,
    checkIn,
    checkOut,
    excludeId,
  );
}

export async function create(
  input: CreateReservationInput,
): Promise<{ reservation: Reservation; overlaps: Reservation[] }> {
  // Business rule: check_out must be after check_in
  if (input.check_out <= input.check_in) {
    throw new Error("Datum odjezdu musí být po datu příjezdu");
  }

  // Check for overlaps
  const overlaps = await reservationsRepo.findOverlapping(
    input.property_id,
    input.check_in,
    input.check_out,
  );

  const insertData: ReservationInsert = {
    property_id: input.property_id,
    guest_names: input.guest_names,
    check_in: input.check_in,
    check_out: input.check_out,
    source: input.source,
    status: input.status,
    rooms: input.rooms,
    adults: input.adults,
    children: input.children,
    price: input.price,
    remarks: input.remarks,
    phone_number: input.phone_number,
    special_requests: input.special_requests,
  };

  const reservation = await reservationsRepo.create(insertData);
  return { reservation, overlaps };
}

export async function update(
  id: string,
  input: UpdateReservationInput,
): Promise<{ reservation: Reservation; overlaps: Reservation[] }> {
  // Verify existence
  const existing = await reservationsRepo.findById(id);
  if (!existing) {
    throw new Error("Rezervace nenalezena");
  }

  // Business rule: if both dates provided, check_out must be after check_in
  const checkIn = input.check_in ?? existing.check_in;
  const checkOut = input.check_out ?? existing.check_out;
  if (checkOut <= checkIn) {
    throw new Error("Datum odjezdu musí být po datu příjezdu");
  }

  // Check for overlaps (excluding self)
  const overlaps = await reservationsRepo.findOverlapping(
    input.property_id ?? existing.property_id,
    checkIn,
    checkOut,
    id,
  );

  const updateData: ReservationUpdate = Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined),
  );

  const reservation = await reservationsRepo.update(id, updateData);
  return { reservation, overlaps };
}

export async function remove(id: string): Promise<void> {
  const existing = await reservationsRepo.findById(id);
  if (!existing) {
    throw new Error("Rezervace nenalezena");
  }
  return reservationsRepo.remove(id);
}
