/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, middleName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.middleName = middleName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** get customer fullname */
  get fullName() {
    if (!this._middleName) {
      return `${this.firstName} ${this.lastName}`;
    }
    else {
      return `${this.firstName} ${this.middleName} ${this.lastName}`;
    }
  }

  /** get customer firstName */
  get firstName() {
    return this._firstName;
  }

  set firstName(firstName) {
    if (!firstName) {
      throw new Error("please pass a First Name")
    }
    this._firstName = firstName;
  }

  /** get customer middleName */
  get middleName() {
    return this._middleName;
  }

  set middleName(middleName) {
    if (middleName) {
      this._middleName = middleName;
    }
  }

  /** get customer lastName */
  get lastName() {
    return this._lastName;
  }

  set lastName(lastName) {
    if (!lastName) {
      throw new Error("please pass a Last Name")
    }
    this._lastName = lastName;
  }

  /** get customer phone */
  get phone() {
    return this._phone;
  }

  set phone(phone) {
    if (phone) {
      this._phone = phone;
    }
  }

  /** get customer notes */
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

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
        first_name AS "firstName",  
        last_name AS "lastName", 
        phone, notes
      FROM customers
      ORDER BY last_name, first_name`
    );
    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
        first_name AS "firstName",  
        last_name AS "lastName", 
        phone, notes 
      FROM customers WHERE id = $1`, [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  static async allByName(term) {
    const results = await db.query(
      `SELECT id, 
        first_name AS "firstName",  
        last_name AS "lastName", 
        phone, notes
      FROM customers
      WHERE first_name LIKE $1`, [term]
    );

    if (results.rows.length === 0) {
      const err = new Error('No results');
      err.status = 404;
      throw err;
    }
    return results.rows.map(c => new Customer(c));
  }

  /** get top 10 customer with higr number of reservations. */

  static async getTopCustomers() {
    const results = await db.query(
      `SELECT c.id, 
      c.first_name AS "firstName",  
      c.last_name AS "lastName", 
      c.phone, c.notes
      FROM customers AS c LEFT JOIN reservations AS r ON c.id = r.customer_id
      GROUP BY c.id
      ORDER BY COUNT(r.id) DESC
      LIMIT 10`
    );
    return results.rows.map(c => new Customer(c));
  }


  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
        WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }

}

module.exports = Customer;
