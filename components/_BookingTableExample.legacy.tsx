import React from "react";
import BookingRow from "./BookingRow";
import { Reservation } from "../types/BookingRowProps";

const exampleBooking: Reservation = {
  book_number: 4966978013,
  booked_by: "Popovich, Arseniy",
  guest_names: "Arseniy Popovich",
  check_in: "2025-03-29",
  check_out: "2025-03-30",
  booked_on: "2025-03-29 09:26:56",
  status: "ok",
  rooms: 1,
  people: 1,
  adults: 1,
  children: 0,
  children_ages: "",
  price: "64.5 EUR",
  commission_percent: 15,
  commission_amount: "9.675 EUR",
  payment_status: "Paid online",
  payment_method: "online",
  remarks: "",
  booker_group: "",
  booker_country: "ua",
  travel_purpose: "Leisure",
  device: "Mobile",
  property_id: 1,
  duration_nights: 1,
  cancellation_date: null,
  address: "",
  phone_number: "38096774 47 77",
  guest_id: null,
};

const BookingTableExample = () => (
  <table>
    <thead>
      <tr>{/* ...hlavičky sloupců... */}</tr>
    </thead>
    <tbody>
      <BookingRow {...exampleBooking} />
    </tbody>
  </table>
);

export default BookingTableExample;
