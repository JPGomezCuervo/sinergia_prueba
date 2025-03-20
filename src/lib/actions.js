"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { SignJWT, decodeJwt } from "jose";
import { 
  db_getUserByEmail,
  db_createUser,
  db_createCompany,
  db_createProduct,
  db_getCompanyByID,
  db_getProducts,
  db_editProduct,
  db_deleteProduct,
  db_getCompanies,
  db_getProductsAndCompanies,
  db_getProductByID,
  db_deleteCompany,
  db_createMember,
  db_getCommissions,
  db_getMembers,
  db_getMemberByID,
  db_deleteMember,
  db_createGoal,
  db_getGoals,
  db_deleteGoal,
  db_getGoalByID,
  db_getCompanyByName
} from "@/lib/db";

import { ErrorCodes, SQLErrorCodes } from "@/lib/errors";
import { makeResponse, Logger } from "@/lib/utils";

/* TODO: CHECK NANS */
/* TODO: remove dev secret */
const JWT_SECRET = /* process.env.JWT_SECRET || */ "dev_secret";
const makeError = (errorCode) => makeResponse(false, errorCode);
const makePayload = (payload) => makeResponse(true, ErrorCodes.NO_ERROR, payload);
const serverLog = new Logger("server");

/* authentication */
export async function login(formData) {

  if (!(formData instanceof FormData))
    return makeError(ErrorCodes.CLIENT_ERROR);

  const email = formData.get("email")?.trim();
  const password = formData.get("password");
  const secret = new TextEncoder().encode(JWT_SECRET);
  let user = null;
  let token = null;
  let cookieStore = null;


  if (!email || !password)
    return makeError(ErrorCodes.INCOMPLETE_FORM);

  user = await db_getUserByEmail(email);

  if (!user)
    return makeError(ErrorCodes.USER_NOT_FOUND);

  try {

    let isMatched = await bcrypt.compare(password, user.user_password);
    if (!isMatched)
      return makeError(ErrorCodes.INVALID_CREDENTIALS);

  } catch(err) {
    serverLog.error(login.name, err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }

  token = await new SignJWT({
    id: user.user_id,
    name: user.user_name,
    email: user.user_email
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);

  cookieStore = await cookies();
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  redirect("/dashboard");
  return makeResponse(true);
}


export async function logout() {
  let cookieStore = null;

  cookieStore = await cookies();
  cookieStore.set("session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });

  redirect("/login");
  return makeResponse(true);
}


export async function signup(formData) {

  if (!(formData instanceof FormData))
    return makeError(ErrorCodes.CLIENT_ERROR);

  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");
  let user = null;
  let success = null;
  let hashedPassword = null;

  if (!email || !password || !name)
    return makeError(ErrorCodes.INCOMPLETE_FORM);

  user = await db_getUserByEmail(email);

  if (user)
    return makeError(ErrorCodes.EMAIL_ALREADY_IN_USE);

  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch(err) {
    serverLog.error(signup.name, err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }

  success = await db_createUser({email,
    password: hashedPassword,
    name: name.toLowerCase()});

  if (!success)
    return makeError(ErrorCodes.SERVER_ERROR);

  redirect("/login");
  return makeResponse(true);
}

/* companies */
export async function createCompany(formData) {

  if (!(formData instanceof FormData))
    return makeError(ErrorCodes.CLIENT_ERROR);

  let user_id = formData.get("user_id");
  const company_name = formData.get("company_name")?.trim();

  user_id = parseInt(user_id);

  if (!user_id || !company_name)
    return makeError(ErrorCodes.INCOMPLETE_FORM);

  try {
    await db_createCompany({company_name, user_id});
    return makeResponse(true);
  } catch (err) {
    if (err.name === "databaseError") {
      if (err.code === SQLErrorCodes.SQLITE_CONSTRAINT_UNIQUE)
        return makeError(ErrorCodes.COMPANY_ALREADY_REGISTERED);
    }

    serverLog.error(createCompany.name, err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}


export async function getCompanyByName(company_name) {
  if (!company_name) {
    serverLog.error(getCompanyByName.name,  "Unexpected arguments, expected <company_name:string>");
    return makeError(ErrorCodes.SERVER_ERROR);
  }
  company_name = String(company_name);

  try {

    const company = await db_getCompanyByName(company_name);

    return JSON.stringify(makePayload(company));

  } catch (err) {

    serverLog.error(getCompanyByName.name,err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}

export async function getCompanies(user_id) {
  if (!user_id || isNaN(user_id)) {
    serverLog.error(getCompanies.name,  "Unexpected arguments, expected <user_id:number>");
    return makeError(ErrorCodes.SERVER_ERROR);
  }
  user_id = parseInt(user_id);

  try {

    const companies = await db_getCompanies(user_id);

    return JSON.stringify(makePayload(companies));

  } catch (err) {

    serverLog.error(getCompanies.name,err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}


export async function deleteCompany(company_id) {
  if (!company_id || isNaN(company_id)) {
    serverLog.error(deleteCompany.name,  "Unexpected arguments, expected: <company_id:number>");
    return makeError(ErrorCodes.SERVER_ERROR);
  }

  company_id = parseInt(company_id);

  /* TODO CHECK the double deletion*/
  try {
    await db_getCompanyByID(company_id);
    await db_deleteCompany(company_id);
    return makeResponse(true);
  } catch (err) {
    serverLog.error(deleteCompany.name, err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}

export async function getProductByID(product_id) {
  if (!product_id) {
    serverLog.error(getProductByID.name,  "Unexpected arguments, expected <product_id:number>");
    return makeError(ErrorCodes.SERVER_ERROR);
  }
  product_id = parseInt(product_id);

  try {

    const product = await db_getProductByID(product_id);

    return JSON.stringify(makePayload(product));

  } catch (err) {

    serverLog.error(getProductByID.name,err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }

}

export async function deleteProduct(product_id) {
  if (!product_id || isNaN(product_id)) {
    serverLog.error(deleteProduct.name, "Unexpected arguments, expected: <product_id:number>");
    return makeError(ErrorCodes.SERVER_ERROR);
  }

  product_id = parseInt(product_id);

  try {
    await db_getProductByID(product_id);
    await db_deleteProduct(product_id);
    return makeResponse(true);
  } catch (err) {
    serverLog.error(deleteProduct.name, err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}


/* products */
export async function createProduct(formData) {

  if (!(formData instanceof FormData))
    return makeError(ErrorCodes.CLIENT_ERROR);

  const product_name = formData.get("product_name")?.trim();
  let company_id = formData.get("company_id");
  let product_price = formData.get("product_price");

  /* The following two are optional */
  let product_description = formData.get("product_description")?.trim();
  let product_closing_rate = formData.get("product_closing_rate");
  let product_quantity = formData.get("product_quantity");

  product_price = parseFloat(product_price);
  product_closing_rate ? product_closing_rate = parseFloat(product_closing_rate) : null;
  product_quantity ? product_quantity = parseInt(product_quantity) : null;
  company_id ? company_id = parseInt(company_id) : null;

  if (!company_id || !product_name || !product_price)
    return makeError(ErrorCodes.INCOMPLETE_FORM);

  if (!product_description)
    product_description = "";

  if (!product_closing_rate)
    product_closing_rate = 0.0;

  if (!product_quantity)
    product_quantity = 0;
    

  try {
    await db_getCompanyByID(company_id);
    await db_createProduct({
      company_id,
      product_name,
      product_price,
      product_description,
      product_closing_rate,
      product_quantity
    });

    return makeResponse(true);
  } catch (err) {
    if (err.name === "databaseError") {
      if (err.code === SQLErrorCodes.SQLITE_CONSTRAINT_UNIQUE)
        return makeError(ErrorCodes.PRODUCT_ALREADY_REGISTERED);
      
      if (err.code === SQLErrorCodes.CUSTOM_NOT_FOUND) 
        return makeError(ErrorCodes.COMPANY_NOT_FOUND);
    }

    serverLog.error(createProduct.name, err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}


export async function editProduct(formData) {

  if (!(formData instanceof FormData))
    return makeError(ErrorCodes.CLIENT_ERROR);

  const product_name = formData.get("product_name")?.trim();
  let company_id = formData.get("company_id");
  let product_id = formData.get("product_id");
  let product_price = formData.get("product_price");

  /* TODO: check conditions */

  /* The following two are optional */
  let product_description = formData.get("product_description")?.trim();
  let product_closing_rate = formData.get("product_closing_rate");
  let product_quantity = formData.get("product_quantity");

  product_price = parseFloat(product_price);
  product_closing_rate ? product_closing_rate = parseFloat(product_closing_rate) : null;
  product_quantity ? product_quantity = parseInt(product_quantity) : null;
  company_id ? company_id = parseInt(company_id) : null;
  product_id = parseInt(product_id);

  if (!company_id || !product_name || !product_price || !product_id)
    return makeError(ErrorCodes.INCOMPLETE_FORM);

  if (!product_description)
    product_description = "";

  if (!product_closing_rate)
    product_closing_rate = 0.0;

  if (!product_quantity)
    product_quantity = 0;



  try {
    await db_getCompanyByID(company_id);
    await db_editProduct({
      company_id,
      product_name,
      product_price,
      product_description,
      product_closing_rate,
      product_quantity,
      product_id
    });

    return makeResponse(true);

  } catch (err) {

    if (err.name === "databaseError") {
      if (err.code === SQLErrorCodes.SQLITE_CONSTRAINT_UNIQUE)
        return makeError(ErrorCodes.PRODUCT_ALREADY_REGISTERED);

      if (err.code === SQLErrorCodes.CUSTOM_NOT_FOUND) 
        return makeError(ErrorCodes.COMPANY_NOT_FOUND);
    }

    serverLog.error(editProduct.name, err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }

}


export async function getProducts(company_id) {
  if (!company_id || isNaN(company_id)) {
    serverLog.error(getProducts.name,  "Unexpected arguments, expected: <company_id:number>");
    return makeError(ErrorCodes.SERVER_ERROR);
  }

  company_id = parseInt(company_id);

  try {
    await db_getCompanyByID(company_id);
    const products = await db_getProducts(company_id);
    return JSON.stringify(makePayload(products));
  } catch (err) {
    serverLog.error(getProducts.name, err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}


export async function getProductsAndCompanies(user_id) {

  if (!user_id || isNaN(user_id)) {
    serverLog.error(getProducts.name,  "Unexpected arguments, expected: <user_id:number>");
    return makeError(ErrorCodes.SERVER_ERROR);
  }

  user_id = parseInt(user_id);

  try {

    const productsAndCompanies = await db_getProductsAndCompanies(user_id);
    return JSON.stringify(makePayload(productsAndCompanies));

  } catch (err) {

    serverLog.error(getProductsAndCompanies.name, err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}


/* members */
export async function createMember(formData) {

  if (!(formData instanceof FormData))
    return makeError(ErrorCodes.CLIENT_ERROR);

  const member_firstname = formData.get("member_firstname")?.toLowerCase();
  const member_lastname = formData.get("member_lastname")?.toLowerCase();
  let company_id = formData.get("company_id");

  if (!member_lastname || !member_firstname || !company_id)
    return ErrorCodes.INCOMPLETE_FORM;

  company_id = parseInt(company_id);

  try {
    await db_createMember({member_firstname, member_lastname, company_id});
    return makeResponse(true);

  } catch(err) {
    if (err.name === "databaseError") {
      if (err.code === SQLErrorCodes.SQLITE_CONSTRAINT_UNIQUE)
        return makeError(ErrorCodes.MEMBER_ALREADY_REGISTERED);
    }
    serverLog.error(createMember.name, err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}


export async function getMembers(user_id) {

  if (!user_id || isNaN(user_id)) {
    serverLog.error(getMembers.name,  "Unexpected arguments, expected <user_id:number>");
    return makeError(ErrorCodes.SERVER_ERROR);
  }

  user_id = parseInt(user_id);

  try {

    const members = await db_getMembers(user_id);
    console.log(JSON.stringify(makePayload(members)));
    return JSON.stringify(makePayload(members));

  } catch (err) {

    serverLog.error(getMembers.name ,err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}

export async function deleteMember(member_id) {
  if (!member_id || isNaN(member_id)) {
    serverLog.error(deleteMember.name,  "Unexpected arguments, expected: <member_id:number>");
    return makeError(ErrorCodes.SERVER_ERROR);
  }

  member_id = parseInt(member_id);

  /* TODO CHECK the double deletion*/
  try {
    await db_getMemberByID(member_id);
    await db_deleteMember(member_id);
    return makeResponse(true);
  } catch (err) {
    serverLog.error(deleteMember.name, err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}

/* commissions */

export async function getCommissions() {
  try {
    const commissions = await db_getCommissions();

    return JSON.stringify(makePayload(commissions));

  } catch (err) {

    serverLog.error(getCommissions.name ,err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}

/* goals */
export async function createGoal(formData) {

  if (!(formData instanceof FormData))
    return makeError(ErrorCodes.CLIENT_ERROR);

  const goal_month = formData.get("goal_month");
  const goal_avg_ticket = formData.get("goal_avg_ticket");
  const goal_rate = formData.get("goal_rate");
  const goal_goal = formData.get("goal_goal");
  const member_id = formData.get("member_id");
  const product_id = formData.get("product_id");
  const commission_id = formData.get("commission_id");
  const user_id = formData.get("user_id");
  const company_id = formData.get("company_id");


  if ( !goal_month || !goal_avg_ticket || !goal_rate || !goal_goal || !member_id || !product_id || !commission_id || !user_id || !company_id)
    return makeError(ErrorCodes.INCOMPLETE_FORM);

  try {

    await db_createGoal({
      goal_month,
      goal_avg_ticket,
      goal_rate,
      goal_goal,
      member_id,
      product_id,
      user_id,
      commission_id,
      company_id
    });

    return makeResponse(true);
  } catch (err) {

    serverLog.error(createGoal.name, err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}


export async function getGoals(user_id) {
  if (!user_id || isNaN(user_id)) {
    serverLog.error(getGoals.name,  "Unexpected arguments, expected <user_id:number>");
    return makeError(ErrorCodes.SERVER_ERROR);
  }
  user_id = parseInt(user_id);

  try {

    const companies = await db_getGoals(user_id);
    return JSON.stringify(makePayload(companies));
  } catch (err) {

    serverLog.error(getGoals.name,err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}

/* utils */
export async function getCurrencyRate(currency_code) {
  try {
    const res = await fetch("https://api.fxratesapi.com/latest");
    const data = await res.json();

    if (!data.success)
      return makeError(ErrorCodes.UNAVAILABLE_RATES);

    const num = data.rates[currency_code];
    return makePayload(Math.trunc(num * 100) / 100);
  } catch(err) {
    serverLog.error(getCurrencyRate.name, err.message);
    return makeError(ErrorCodes.UNAVAILABLE_RATES);
  }
}

export async function deleteGoal(goal_id) {
  if (!goal_id || isNaN(goal_id)) {
    serverLog.error(deleteGoal.name, "Unexpected arguments, expected: <goal_id:number>");
    return makeError(ErrorCodes.SERVER_ERROR);
  }

  goal_id = parseInt(goal_id);

  try {
    await db_getGoalByID(goal_id);
    await db_deleteGoal(goal_id);
    return makeResponse(true);
  } catch (err) {
    serverLog.error(deleteGoal.name, err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}

export async function getGoalByID(goal_id) {
  if (!goal_id || isNaN(goal_id)) {
    serverLog.error(getGoalByID.name, "Unexpected arguments, expected: <goal_id:number>");
    return makeError(ErrorCodes.SERVER_ERROR);
  }

  goal_id = parseInt(goal_id);

  try {
    const goal = await db_getGoalByID(goal_id);

    if (!goal)
      return makeError(ErrorCodes.CLIENT_ERROR);

    return JSON.stringify(makePayload(goal));
  } catch (err) {
    serverLog.error(getGoalByID.name, err);
    return makeError(ErrorCodes.SERVER_ERROR);
  }
}


export async function getVAT() {
  return makePayload(0.21);
}

/* TODO: Check what happen the session is expired */
export async function getCurrentUserID() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const userID = decodeJwt(token).id;
  return makePayload(userID);
}
