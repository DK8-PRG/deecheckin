import React from "react";
import { Reservation } from "../types/BookingRowProps";

const BookingRow: React.FC<Reservation> = (props) => {
  return (
    <tr>
      <td>{props.book_number}</td>
      <td>{props.booked_by}</td>
      <td>{props.guest_names}</td>
      <td>{props.check_in}</td>
      <td>{props.check_out}</td>
      <td>{props.booked_on}</td>
      <td>{props.status}</td>
      <td>{props.rooms}</td>
      <td>{props.people}</td>
      <td>{props.adults}</td>
      <td>{props.children}</td>
      <td>{props.children_ages}</td>
      <td>{props.price}</td>
      <td>{props.commission_percent}</td>
      <td>{props.commission_amount}</td>
      <td>{props.payment_status}</td>
      <td>{props.payment_method}</td>
      <td>{props.remarks}</td>
      <td>{props.booker_group}</td>
      <td>{props.booker_country}</td>
      <td>{props.travel_purpose}</td>
      <td>{props.device}</td>
      <td>{props.phone_number}</td>
    </tr>
  );
};

export default BookingRow;
