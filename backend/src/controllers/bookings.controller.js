import connection from "../config/db.js";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const mapBookingRow = (row) => ({
  id: row.id,
  hostelId: row.hostel_id,
  bookingDate: row.booking_date,
  status: row.status,
  createdAt: row.created_at,
  hostelName: row.hostel_name,
  location: row.location,
  price: row.price === null || row.price === undefined ? null : Number(row.price),
  roomType: row.room_type,
});

const mapPaymentRow = (row) => ({
  id: row.id,
  bookingId: row.booking_id,
  amount: Number(row.amount),
  status: row.payment_status,
  method: "Simulated",
  createdAt: row.created_at,
});

// POST /api/bookings
export const createBooking = (req, res) => {
  const studentId = req.user.id;
  const hostelId = Number.parseInt(req.body.hostelId, 10);
  const bookingDate = typeof req.body.bookingDate === "string" ? req.body.bookingDate.trim() : "";

  if (!Number.isInteger(hostelId) || hostelId <= 0) {
    return res.status(400).json({ message: "Invalid hostel ID" });
  }

  if (!ISO_DATE_REGEX.test(bookingDate)) {
    return res.status(400).json({ message: "Booking date must be a valid date (YYYY-MM-DD)" });
  }

  const parsedDate = new Date(`${bookingDate}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: "Booking date must be a valid date (YYYY-MM-DD)" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsedDate < today) {
    return res.status(400).json({ message: "Booking date cannot be in the past" });
  }

  connection.query(
    "SELECT id, verified, availability FROM hostels WHERE id = ?",
    [hostelId],
    (hostelErr, hostels) => {
      if (hostelErr) return res.status(500).json({ error: hostelErr.message });
      if (!hostels.length) return res.status(404).json({ message: "Hostel not found" });

      const hostel = hostels[0];
      if (!hostel.verified) {
        return res.status(400).json({ message: "Hostel is not verified" });
      }
      if (hostel.availability !== "available") {
        return res.status(400).json({ message: "Hostel is not available" });
      }

      connection.query(
        "SELECT id FROM bookings WHERE user_id = ? AND hostel_id = ? AND status != 'cancelled'",
        [studentId, hostelId],
        (checkErr, existing) => {
          if (checkErr) return res.status(500).json({ error: checkErr.message });
          if (existing.length) {
            return res
              .status(409)
              .json({ message: "You already have an active booking for this hostel" });
          }

          connection.query(
            "INSERT INTO bookings (user_id, hostel_id, booking_date, status) VALUES (?, ?, ?, 'pending')",
            [studentId, hostelId, bookingDate],
            (insertErr, result) => {
              if (insertErr) {
                if (insertErr.code === "ER_DUP_ENTRY") {
                  return res.status(409).json({
                    message: "You already have a booking for this hostel on that date",
                  });
                }
                return res.status(500).json({ error: insertErr.message });
              }

              const sql = `
                SELECT
                  b.id, b.hostel_id, b.booking_date, b.status, b.created_at,
                  h.name AS hostel_name, h.location, h.price, h.room_type
                FROM bookings b
                INNER JOIN hostels h ON h.id = b.hostel_id
                WHERE b.id = ?
              `;
              connection.query(sql, [result.insertId], (rowErr, rows) => {
                if (rowErr) return res.status(500).json({ error: rowErr.message });
                return res.status(201).json({ booking: mapBookingRow(rows[0]) });
              });
            }
          );
        }
      );
    }
  );
};

// GET /api/bookings/my
export const listMyBookings = (req, res) => {
  const studentId = req.user.id;
  const sql = `
    SELECT
      b.id, b.hostel_id, b.booking_date, b.status, b.created_at,
      h.name AS hostel_name, h.location, h.price, h.room_type
    FROM bookings b
    INNER JOIN hostels h ON h.id = b.hostel_id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `;

  connection.query(sql, [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.status(200).json({ bookings: results.map(mapBookingRow) });
  });
};

// PATCH /api/bookings/:id/cancel
export const cancelBooking = (req, res) => {
  const studentId = req.user.id;
  const bookingId = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return res.status(400).json({ message: "Invalid booking ID" });
  }

  connection.query(
    "SELECT id, status FROM bookings WHERE id = ? AND user_id = ?",
    [bookingId, studentId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!rows.length) return res.status(404).json({ message: "Booking not found" });
      if (rows[0].status !== "pending") {
        return res.status(409).json({ message: "Only pending bookings can be cancelled" });
      }

      connection.query(
        "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
        [bookingId],
        (updateErr) => {
          if (updateErr) return res.status(500).json({ error: updateErr.message });
          return res.status(200).json({ id: bookingId, status: "cancelled" });
        }
      );
    }
  );
};

// POST /api/bookings/:id/pay
export const simulatePay = (req, res) => {
  const studentId = req.user.id;
  const bookingId = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return res.status(400).json({ message: "Invalid booking ID" });
  }

  const sql = `
    SELECT
      b.id, b.hostel_id, b.booking_date, b.status, b.created_at,
      h.name AS hostel_name, h.location, h.price, h.room_type
    FROM bookings b
    INNER JOIN hostels h ON h.id = b.hostel_id
    WHERE b.id = ? AND b.user_id = ?
  `;

  connection.query(sql, [bookingId, studentId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(404).json({ message: "Booking not found" });

    const booking = rows[0];
    if (booking.status !== "pending") {
      return res.status(409).json({ message: "Only pending bookings can be paid" });
    }

    const amount = Number(booking.price);

    connection.query(
      "INSERT INTO payments (booking_id, amount, payment_status) VALUES (?, ?, 'completed')",
      [bookingId, amount],
      (payErr, payResult) => {
        if (payErr) return res.status(500).json({ error: payErr.message });

        connection.query(
          "UPDATE bookings SET status = 'confirmed' WHERE id = ?",
          [bookingId],
          (updateErr) => {
            if (updateErr) return res.status(500).json({ error: updateErr.message });

            connection.query(
              "SELECT id, booking_id, amount, payment_status, created_at FROM payments WHERE id = ?",
              [payResult.insertId],
              (fetchErr, payRows) => {
                if (fetchErr) return res.status(500).json({ error: fetchErr.message });
                return res.status(200).json({
                  booking: mapBookingRow({ ...booking, status: "confirmed" }),
                  payment: mapPaymentRow(payRows[0]),
                });
              }
            );
          }
        );
      }
    );
  });
};

// GET /api/bookings/:id/payment
export const getPayment = (req, res) => {
  const studentId = req.user.id;
  const bookingId = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return res.status(400).json({ message: "Invalid booking ID" });
  }

  const sql = `
    SELECT p.id, p.booking_id, p.amount, p.payment_status, p.created_at
    FROM payments p
    INNER JOIN bookings b ON b.id = p.booking_id
    WHERE b.id = ? AND b.user_id = ?
    ORDER BY p.id DESC
    LIMIT 1
  `;

  connection.query(sql, [bookingId, studentId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(404).json({ message: "Payment not found" });
    return res.status(200).json({ payment: mapPaymentRow(rows[0]) });
  });
};
