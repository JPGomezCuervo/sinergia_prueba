import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  className,
  ...props
}) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
        <h1 className="text-2xl font-bold text-center">¡Bienvenido de nuevo!</h1>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" required />
          <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </div>
      <div className="text-center text-sm">
        ¿No estás registrado?{" "}
        <a href="#" className="underline underline-offset-4">
          Registrate
        </a>
      </div>
    </form>
  );
}
