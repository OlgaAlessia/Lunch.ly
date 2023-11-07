/** Reservation for Lunchly */

const moment = require("moment");
const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({ id, customerId, numGuests, dateAt, timeAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.dateAt = dateAt;
    this.timeAt = timeAt;
    this.notes = notes;
  }

  /** validate customer Id */
  get customerId() {
    return this._customerId;
  }

  set customerId(customerId) {
    this._customerId = customerId;
  }

  /** get reservation number of guests */
  get numGuests() {
    return this._numGuests;
  }

  set numGuests(numGuests) {
    if (numGuests < 1) {
      throw new Error("The number of guest as to be more than 1");
    }
    this._numGuests = numGuests;
  }

  /** get reservation the date  */
  get dateAt() {
    return this._dateAt;
  }
  set dateAt(val) {
    if (val !== "Invalid Date") {
      this._dateAt = val;
    }
    else {
      throw new Error("Please put a valid date");
    }
  }

  /** get reservation the time  */
  get timeAt() {
    return this._timeAt;
  }
  set timeAt(val) {
    if (val !== "Invalid Time") {
      this._timeAt = val;
    }
    else {
      throw new Error("Please put a valid time");
    }
  }

  /** get reservation notes */
  get notes() {
    return this._notes;
  }

  set notes(notes) {
    if (!notes) {
      this._notes = ""
    }
    else {
      this._notes = notes;
    }
  }

  /** get reservation by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
        customer_id AS "customerId", 
        num_guests AS "numGuests", 
        date_at AS "dateAt",
        time_at AS "timeAt",
        notes AS "notes"
      FROM reservations
      WHERE id = $1`, [id]
    );

    return new Reservation(results.rows[0]);
  }

  /** formatter for startAt */

  //getformattedStartAt() {
  //  return moment(this.startAt).format('MMMM Do YYYY, h:mm');
  //}

  getStartAt() {
    return moment(this.dateAt).format('MMMM Do YYYY') + ' ' + this.timeAt;
  }

  getInputStartAt() {
    return moment(this.dateAt).format('YYYY-MM-DD');
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id, 
        customer_id AS "customerId", 
        num_guests AS "numGuests", 
        date_at AS "dateAt",
        time_at AS "timeAt",
        notes AS "notes"
      FROM reservations 
      WHERE customer_id = $1`, [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }


  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, date_at, time_at, num_guests, notes) 
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id`,
        [this.customerId, this.dateAt, this.timeAt, this.numGuests, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations SET date_at=$1, time_at=$2, num_guests=$3, notes=$4
        WHERE id=$5`,
        [this.dateAt, this.timeAt, this.numGuests, this.notes, this.id]
      );
    }
  }
}



module.exports = Reservation;
