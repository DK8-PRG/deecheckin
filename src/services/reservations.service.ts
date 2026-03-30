import type {
  Reservation,
  ReservationInsert,
  ReservationUpdate,
} from "@/types/reservation";
import type {
  CreateReservationInput,
  UpdateReservationInput,
} from "@/validators/reservation.schema";
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

export async function create(
  input: CreateReservationInput,
): Promise<Reservation> {
  // Business rule: check_out must be after check_in
  if (input.check_out <= input.check_in) {
    throw new Error("Datum odjezdu musí být po datu příjezdu");
  }

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

  return reservationsRepo.create(insertData);
}

export async function update(
  id: string,
  input: UpdateReservationInput,
): Promise<Reservation> {
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

  const updateData: ReservationUpdate = {};
  if (input.property_id !== undefined)
    updateData.property_id = input.property_id;
  if (input.guest_names !== undefined)
    updateData.guest_names = input.guest_names;
  if (input.check_in !== undefined) updateData.check_in = input.check_in;
  if (input.check_out !== undefined) updateData.check_out = input.check_out;
  if (input.source !== undefined) updateData.source = input.source;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.rooms !== undefined) updateData.rooms = input.rooms;
  if (input.adults !== undefined) updateData.adults = input.adults;
  if (input.children !== undefined) updateData.children = input.children;
  if (input.price !== undefined) updateData.price = input.price;
  if (input.remarks !== undefined) updateData.remarks = input.remarks;
  if (input.phone_number !== undefined)
    updateData.phone_number = input.phone_number;
  if (input.special_requests !== undefined)
    updateData.special_requests = input.special_requests;

  return reservationsRepo.update(id, updateData);
}

export async function remove(id: string): Promise<void> {
  const existing = await reservationsRepo.findById(id);
  if (!existing) {
    throw new Error("Rezervace nenalezena");
  }
  return reservationsRepo.remove(id);
}
