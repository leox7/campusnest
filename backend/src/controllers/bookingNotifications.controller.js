import connection from "../config/db.js";

const mapBookingNotification = (row) => ({
  id: row.id,
  hostelId: row.hostel_id,
  hostelName: row.hostel_name,
  location: row.location,
  roomType: row.room_type,
  price: row.price === null || row.price === undefined ? null : Number(row.price),
  bookingDate: row.booking_date,
  status: row.status,
  createdAt: row.created_at,
  student: {
    name: row.student_name,
    email: row.student_email,
  },
  payment: row.payment_status
    ? {
        status: row.payment_status,
        amount: row.paid_amount === null || row.paid_amount === undefined ? null : Number(row.paid_amount),
        paidAt: row.paid_at,
      }
    : null,
});

// GET /api/landlord/bookings — bookings on the authenticated landlord's hostels
export const listLandlordBookings = (req, res) => {
  const sql = `
    SELECT
      b.id, b.hostel_id, b.booking_date, b.status, b.created_at,
      h.name AS hostel_name, h.location, h.price, h.room_type,
      u.full_name AS student_name, u.email AS student_email,
      p.payment_status, p.amount AS paid_amount, p.created_at AS paid_at
    FROM bookings b
    INNER JOIN hostels h ON h.id = b.hostel_id
    INNER JOIN users u ON u.id = b.user_id
    LEFT JOIN payments p ON p.id = (
      SELECT id FROM payments WHERE booking_id = b.id ORDER BY id DESC LIMIT 1
    )
    WHERE h.landlord_id = ?
    ORDER BY b.created_at DESC
  `;

  connection.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.status(200).json({ bookings: results.map(mapBookingNotification) });
  });
};

// GET /api/admin/bookings — all bookings across the platform
export const listAdminBookings = (req, res) => {
  const sql = `
    SELECT
      b.id, b.hostel_id, b.booking_date, b.status, b.created_at,
      h.name AS hostel_name, h.location, h.price, h.room_type,
      u.full_name AS student_name, u.email AS student_email,
      lu.full_name AS landlord_name, lu.email AS landlord_email,
      p.payment_status, p.amount AS paid_amount, p.created_at AS paid_at
    FROM bookings b
    INNER JOIN hostels h ON h.id = b.hostel_id
    INNER JOIN users u ON u.id = b.user_id
    INNER JOIN users lu ON lu.id = h.landlord_id
    LEFT JOIN payments p ON p.id = (
      SELECT id FROM payments WHERE booking_id = b.id ORDER BY id DESC LIMIT 1
    )
    ORDER BY b.created_at DESC
  `;

  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const bookings = results.map((row) => ({
      ...mapBookingNotification(row),
      landlord: {
        name: row.landlord_name,
        email: row.landlord_email,
      },
    }));
    return res.status(200).json({ bookings });
  });
};
