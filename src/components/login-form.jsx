"use client"

import { cn } from "@/lib/utils"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export function LoginForm({
  className,
  ...props
}) {

  const initialState = {
    message: "",
  };

  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    return await props.action(formData);
  }, initialState);

  return (
    <form className={cn("flex flex-col gap-6", className)} action={formAction}>
      <h1 className="text-2xl font-bold text-center">¡Bienvenido de nuevo!</h1>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" type="email" name="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" name="password" required />
          <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <p aria-live="polite" className="text-red-500 text-base font-bold text-center">{state?.message}</p>
        <Button type="submit" className="w-full" disabled={pending}>
          Ingresa
        </Button>
      </div>
      <div className="text-center text-sm">
        ¿No estás registrado?{" "}
        <Link href="/signup" className="underline underline-offset-4">
          Regístrate
        </Link>
      </div>
    </form>
  );
}
