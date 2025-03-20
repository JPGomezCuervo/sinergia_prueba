import { DatabaseError, SQLErrorCodes } from "@/lib/errors";
import { Logger, capitalize } from "@/lib/utils";
import { createClient } from "@libsql/client";

export const turso = createClient({

  url: "file:/home/juan/Projects/sinergia_prueba/tursotest.sqlite",
  //url: process.env.TURSO_DATABASE_URL,
  //authToken: process.env.TURSO_AUTH_TOKEN,
});

const dbLogger = new Logger("db");

turso.execute(`
  CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  user_password TEXT NOT NULL,
  user_name TEXT NOT NULL
  );
`);

turso.execute(`
  CREATE TABLE IF NOT EXISTS companies (
  company_id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  UNIQUE (company_name, user_id)
  );
`);

turso.execute(`
  CREATE TABLE IF NOT EXISTS products (
  product_id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  product_closing_rate FLOAT NOT NULL ,
  product_price FLOAT NOT NULL,
  product_description TEXT NOT NULL,
  product_quantity INTEGER NOT NULL,
  product_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (product_name, company_id)
  );
`);

turso.execute(`
  CREATE TABLE IF NOT EXISTS members (
  member_id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_firstname TEXT NOT NULL,
  member_lastname TEXT NOT NULL,
  company_id INTEGER NOT NULL,
  UNIQUE (company_id, member_id)
  );
`);

turso.execute(`
  CREATE TABLE IF NOT EXISTS goals (
  goal_id INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_month INTEGER NOT NULL,
  goal_avg_ticket FLOAT NOT NULL,
  goal_rate FLOAT NOT NULL,
  goal_goal FLOAT NOT NULL,
  member_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  commission_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  company_id INTEGER NOT NULL,
  goal_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

turso.execute(
  `
  CREATE TABLE IF NOT EXISTS commissions (
  commission_id INTEGER PRIMARY KEY AUTOINCREMENT,
  commission_value FLOAT NOT NULL,
  commission_factor FLOAT NOT NULL
  );
`
);

/* users */
export async function db_getUserByEmail(email) {
  try {

    const query = await turso.execute("SELECT * FROM users WHERE user_email = ?", [email]);
    dbLogger.info(db_getUserByEmail.name, "ok");
    return query.rows[0] || null;

  } catch (err) {

    dbLogger.error(db_getUserByEmail.name, err);
    throw err;
  }
}

export async function db_createUser({ email, password, name }) {
  try {

    const stmt = `INSERT INTO users (
      user_name,
      user_email,
      user_password
      ) VALUES (?, ?, ?)`;

    const info = await turso.execute(stmt, [name, email, password]);

    dbLogger.info(db_createUser.name, "ok insertion");
    return info.rowsAffected > 0;

  } catch (err) {

    dbLogger.error(db_createUser.name, err);
    throw err;
  }
}


/* products */
export async function db_createProduct({ 
  company_id,
  product_name,
  product_closing_rate,
  product_price,
  product_description,
  product_quantity 
}) {

  try {

    const stmt = `INSERT INTO products (
      company_id,
      product_name,
      product_price,
      product_description,
      product_quantity,
      product_closing_rate
      ) VALUES (?, ?, ?, ?, ?, ?)`;

    const info = await turso.execute(stmt, [
      company_id,
      product_name,
      product_price,
      product_description,
      product_quantity,
      product_closing_rate
    ]
    );

    dbLogger.info(db_createProduct.name, "ok insertion");

    return info.rowsAffected > 0;

  } catch (err) {

    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      dbLogger.warn(db_createProduct.name, "failed insertion", err);
      throw new DatabaseError(err, SQLErrorCodes.SQLITE_CONSTRAINT_UNIQUE);
    }

    dbLogger.error(db_createProduct.name, err.code);
    throw err;
  }
}


export async function db_editProduct({ 
  company_id,
  product_id,
  product_name,
  product_closing_rate,
  product_price,
  product_description,
  product_quantity 
}) {

  try {

    const stmt =` UPDATE products SET 
        company_id = ?, 
        product_name = ?, 
        product_price = ?, 
        product_description = ?, 
        product_quantity = ?, 
        product_closing_rate = ?
        WHERE product_id = ?
        `;

    const info = await turso.execute(stmt,
      [
        company_id,
        product_name,
        product_price,
        product_description,
        product_quantity,
        product_closing_rate,
        product_id
      ]
    );

    dbLogger.info(db_editProduct.name, "ok update");
    return info.rowsAffected > 0;

  } catch (err) {

    dbLogger.error(db_editProduct.name, err);
    throw err;
  }
}


export async function db_deleteProduct(product_id) {
  try {

    const stmt = "DELETE FROM products WHERE product_id = ?";
    const info = await turso.execute(stmt, [product_id]);

    return info.rowsAffected > 0;

  } catch (err) {

    dbLogger.error(db_deleteProduct.name, err);
    throw err;
  }
}


export async function db_getProducts(company_id) {
  try {
    const query = "SELECT * FROM products WHERE company_id = ?";
    const products = await turso.execute(query, [company_id]);
    dbLogger.info(db_getProducts.name, "ok selection");

    return products.rows;

  } catch (err) {

    dbLogger.error(db_getProducts.name, err);
    throw new DatabaseError(err, err.code);
  }
}


export async function db_getProductByID(product_id) {
  try {

    const query = "SELECT * FROM products WHERE product_id = ?";
    const product = await turso.execute(query, [product_id]);

    if (!product)  {
      const error = new DatabaseError(
        `Product with ID ${product_id} NOT FOUND`,
        SQLErrorCodes.CUSTOM_NOT_FOUND
      );

      dbLogger.error(db_getProductByID.name, error.message);
      throw error;
    }

    dbLogger.info(db_getProductByID.name, "ok selection");
    return product.rows[0];

  } catch (err) {

    dbLogger.error(db_getProductByID.name, err);
    throw err;
  }
}


/* companies */
export async function db_createCompany({ company_name, user_id }) {

  try {

    const stmt = `INSERT INTO companies (
      company_name,
      user_id
      ) VALUES (?, ?)`;

    const info = await turso.execute(stmt, [company_name, user_id]);

    dbLogger.info(db_createCompany.name, "ok insertion");
    return info.rowsAffected > 0;

  } catch (err) {

    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      dbLogger.warn(db_createCompany.name, "failed insertion", err);
      throw new DatabaseError(err, SQLErrorCodes.SQLITE_CONSTRAINT_UNIQUE);
    }

    dbLogger.error(db_createCompany.name, err);
    throw err;
  }
}


export async function db_deleteCompany(company_id) {
  try {

    const delete_products_stmt = await turso.execute("DELETE FROM products WHERE company_id = ?", [company_id]);

    const delete_companies_stmt = await turso.execute("DELETE FROM companies WHERE company_id = ?", [company_id]);

    const delete_members_stmt = await turso.execute("DELETE FROM members WHERE company_id = ?", [company_id]);

    if (!delete_products_stmt.rowsAffected || !delete_companies_stmt || !delete_members_stmt.rowsAffected)
      throw new Error("Hubo un error eliminando la empresa, por favor comuníquese con administrador");

    return  true;

  } catch (err) {

    dbLogger.error(db_deleteCompany.name, err);
    throw err;
  }
}


export async function db_getCompanies(user_id) {

  try {

    const query = await turso.execute("SELECT company_id, company_name FROM companies WHERE user_id = ?", [user_id]);

    dbLogger.info(db_getCompanies.name, "ok selection");

    return query.rows;

  } catch (err) {

    dbLogger.error(db_getCompanies.name, err);
    throw new DatabaseError(err, err.code);
  }
}


export async function db_getProductsAndCompanies(user_id) {
  try {
    const query = `
WITH filtered_companies AS (
SELECT * FROM companies WHERE user_id = ?
)
SELECT p.*, c.*
FROM products p
INNER JOIN filtered_companies c ON p.company_id = c.company_id;
`;

    const joinedTable = await turso.execute(query, [user_id]);

    dbLogger.info(db_getProductsAndCompanies.name, "ok selection");
    return joinedTable.rows;
  } catch (err) {
    dbLogger.error(db_getProductsAndCompanies.name, err);
    throw new DatabaseError(err, err.code);
  }
}

export async function db_getCompanyByName(company_name) {
  try {

    const query = await turso.execute("SELECT * FROM companies WHERE company_name = ?", [company_name]);

    if (!query.rows.length === 0)  {
      const error = DatabaseError(
        `Company with ID ${company_name} NOT FOUND`,
        SQLErrorCodes.CUSTOM_NOT_FOUND
      );

      dbLogger.error(db_getCompanyByName.name, error.message);
      throw error;
    }

    dbLogger.info(db_getCompanyByName.name, "ok selection");

    return query.rows[0];

  } catch (err) {

    dbLogger.error(db_getCompanyByName.name, err);
    throw new DatabaseError(err, err.code);
  }
}


export async function db_getCompanyByID(company_id) {
  try {

    const query = await turso.execute("SELECT * FROM companies WHERE company_id = ?", [company_id]);
    const company = query.rows[0]; 

    if (!company)  {
      const error = DatabaseError(
        `Company with ID ${company_id} NOT FOUND`,
        SQLErrorCodes.CUSTOM_NOT_FOUND
      );

      dbLogger.error(db_getCompanyByID.name, error.message);
      throw error;
    }

    dbLogger.info(db_getCompanyByID.name, "ok selection");
    return company.rows;

  } catch (err) {

    dbLogger.error(db_getCompanyByID.name, err);
    throw new DatabaseError(err, err.code);
  }
}

/* members */

export async function db_createMember({ member_lastname, member_firstname, company_id }) {

  try {

    const stmt = `INSERT INTO members (
member_lastname,
member_firstname,
company_id
) VALUES (?, ?, ?);`;

    const info = await turso.execute(stmt, [member_lastname, member_firstname, company_id]);

    dbLogger.info(db_createMember.name, "ok insertion");
    return info.rowsAffected > 0;

  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      dbLogger.warn(db_createMember.name, "failed insertion", err);
      throw new DatabaseError(err, SQLErrorCodes.SQLITE_CONSTRAINT_UNIQUE);
    }

    dbLogger.error(db_createMember.name, err);
    throw err;
  }
}


export async function db_getMembers(user_id) {
  try {

    const query = `
      WITH vc AS (
      SELECT * FROM companies WHERE user_id = ?
      )
      SELECT vc.*, m.*
      FROM members m
      INNER JOIN vc ON m.company_id = vc.company_id
`;

    let members = await turso.execute(query, [user_id]);

    members = members.rows.map(member => ({
      ...member,
      member_firstname: capitalize(member.member_firstname),
      member_lastname: capitalize(member.member_lastname)
    }));

    dbLogger.info(db_getMembers.name, "ok selection");
    console.log(members);

    return members;

  } catch (err) {

    dbLogger.error(db_getMembers.name, err);
    throw new DatabaseError(err, err.code);
  }
}

export async function db_deleteMember(member_id) {
  try {

    const stmt = "DELETE FROM members WHERE member_id = ?";
    const info = await turso.execute(stmt, [member_id]);

    return info.rowsAffected > 0;

  } catch (err) {

    dbLogger.error(db_deleteMember.name, err);
    throw err;
  }
}

export async function db_getMemberByID(member_id) {
  try {

    const query = "SELECT * FROM members WHERE member_id = ?";
    const member = await turso.execute(query, [member_id]);

    if (!member)  {
      const error = DatabaseError(
        `member with ID ${member_id} NOT FOUND`,
        SQLErrorCodes.CUSTOM_NOT_FOUND
      );

      dbLogger.error(db_getMemberByID.name, error.message);
      throw error;
    }

    dbLogger.info(db_getMemberByID.name, "ok selection");
    return member.member_id;

  } catch (err) {

    dbLogger.error(db_getMemberByID.name, err);
    throw new DatabaseError(err, err.code);
  }
}

/* commissions */
export async function db_getCommissions() {
  try {

    const query = "SELECT * FROM commissions";
    const commissions = await turso.execute(query);

    dbLogger.info(db_getCommissions.name, "ok selection");
    return commissions.rows;

  } catch (err) {

    dbLogger.error(db_getCommissions.name, err);
    throw new DatabaseError(err, err.code);
  }
}

/* goals */
export async function db_createGoal({
  goal_month,
  goal_goal,
  goal_avg_ticket,
  goal_rate,
  member_id,
  product_id,
  user_id,
  commission_id,
  company_id
}) {
  try {

    const stmt = `INSERT INTO goals (
        goal_month,
        goal_goal,
        goal_avg_ticket,
        goal_rate,
        member_id,
        product_id,
        user_id,
        commission_id,
        company_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const info = await turso.execute(stmt, [
      goal_month,
      goal_goal,
      goal_avg_ticket,
      goal_rate,
      member_id,
      product_id,
      user_id,
      commission_id,
      company_id
    ]
    );

    dbLogger.info(db_createGoal.name, "ok insertion");
    return info.changes > 0;

  } catch (err) {

    dbLogger.error(db_createGoal.name, err);
    throw err;
  }
}

export async function db_getGoals(user_id) {
  try {

    const query =`
  WITH virtual_goal AS (
    SELECT * FROM goals WHERE user_id = ?
  )
  SELECT vg.*, m.*, p.*, c.*, com.company_name
  FROM members m
  INNER JOIN virtual_goal vg ON m.member_id = vg.member_id
  INNER JOIN products p ON vg.product_id = p.product_id
  INNER JOIN commissions c ON vg.commission_id = c.commission_id
  INNER JOIN companies com ON vg.company_id = com.company_id
`;

    const goals = await turso.execute(query, [user_id]);

    dbLogger.info(db_getGoals.name, "ok selection");
    return goals.rows;

  } catch (err) {

    dbLogger.error(db_getGoals.name, err);
    throw new DatabaseError(err, err.code);
  }
}

export async function db_deleteGoal(goal_id) {
  try {

    const stmt = "DELETE FROM goals WHERE goal_id = ?";
    const info = await turso.execute(stmt, [goal_id]);

    return info.rowsAffected > 0;

  } catch (err) {

    dbLogger.error(db_deleteGoal.name, err);
    throw err;
  }
}

export async function db_getGoalByID(goal_id) {
  try {

    const query = "SELECT * FROM goals WHERE goal_id = ?";
    const goal = await turso.execute(query, [goal_id]);

    if (!goal)  {
      const error = DatabaseError(
        `Goal with ID ${goal_id} NOT FOUND`,
        SQLErrorCodes.CUSTOM_NOT_FOUND
      );

      dbLogger.error(db_getGoalByID.name, error.message);
      throw error;
    }

    dbLogger.info(db_getGoalByID.name, "ok selection");

    if (goal.rows.length === 0)
      return null;

    return goal.rows[0];

  } catch (err) {

    dbLogger.error(db_getGoalByID.name, err);
    throw new DatabaseError(err, err.code);
  }
}
