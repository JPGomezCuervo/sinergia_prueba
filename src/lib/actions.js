"use server"

import { redirect } from "next/navigation";
import { getUserByEmail, createUser } from "@/lib/db";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

/* TODO: remove dev secret */
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export async function login(formData) {
  const email = formData.get("email")?.trim();
  const password = formData.get("password");
  const secret = new TextEncoder().encode(JWT_SECRET);
  let user = null;
  let token = null;


  if (!email || !password)
    return { message: "Formulario incompleto, revisa los campos" };

  user = await getUserByEmail(email);

  if (!user)
    return { message: "Usuario no encontrado" }

  try {

    let isMatched = await bcrypt.compare(password, user.user_password);
    if (!isMatched)
      return { message: "Datos incorrectos" };

  } catch(err) {
    console.error("[HASH ERROR] login:", err);
    return { message: "Ups, algo salió mal, intenta de nuevo más tarde" };
  }

token = await new SignJWT({id: user.user_id, name: user.user_name, email: user.user_email})
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("1d")
  .sign(secret);

  cookies().set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  return redirect("/dashboard");
}


export async function signup(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");
  let user = null;
  let success = null;
  let hashedPassword = null;

  if (!email || !password || !name)
    return { message: "Formulario incompleto, revisa los campos" };

  user = await getUserByEmail(email);

  if (user)
    return { message: "Correo electrónico en uso..." };

  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch(err) {
    console.error("[HASH ERROR] signup:", err);
    return { message: "Ups, algo salió mal, intenta de nuevo más tarde" };
  }

  success = await createUser({email, password: hashedPassword, name: name.toLowerCase()});

  if (!success)
    return { message: "Ups, algo saló mal, intenta de nuevo más tarde"};

  return redirect("/dashboard");
}
