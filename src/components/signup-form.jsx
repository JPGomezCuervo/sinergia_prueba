"use client"

import { cn } from "@/lib/utils"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export function SignUpForm({
  className,
  ...props
}) {

  const initialState = {
    message: "",
  };

  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    const pass = formData.get("password");
    const checkpassword = formData.get("checkpassword");
    const name = formData.get("name");
    const email = formData.get("email");

    if (pass === checkpassword) {
      formData.delete("checkpassword");
      return await props.action(formData);
    } else {
      console.log(pass, checkpassword);
      return { message: "Las contraseñas no coinciden" };
    }
  }, initialState);

  return (
    <form className={cn("flex flex-col gap-6", className)} action={formAction}>
      <h1 className="text-2xl font-bold text-center">¡Regístrate en Sinergia Creativa!</h1>
      <div className="grid gap-6">

        <div className="grid gap-3">
          <Label htmlFor="name">Nombre completo</Label>
          <Input id="name" type="name" name="name" placeholder="Pepito Pérez" required />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" type="email" name="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" name="password" required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="checkpassword">Ingresa de nuevo tu contraseña</Label>
          <Input id="checkpassword" type="password" name="checkpassword" required />
        </div>
        <p aria-live="polite" className="text-red-500 text-base font-bold text-center">{state?.message}</p>
        <Button type="submit" className="w-full" disabled={pending}>
          Regístrate
        </Button>
      </div>
    </form>
  );
}
