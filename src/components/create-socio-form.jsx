"use client";
import { cn } from "@/lib/utils";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/lib/utils";
import { createMember } from "@/lib/actions";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateForm({
  className,
  companies
}) {

  const initialState = {
    message: "",
  };

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    return await createMember(formData);
  }, initialState);

  function handleChange(e) {
    const input = e.target.value;
    if(!/^[a-zA-Z]*$/.test(input)) {
      e.target.value = input.replace(/\d/g, "");
    }
    if(e.target.name === "member_firstname") {
      setFirstName(e.target.value);
    }

    if(e.target.name === "member_lastname") {
      setLastName(e.target.value);
    }
  }


  useEffect(() => {
    if(state.succeed) {
      setFirstName("");
      setLastName("");
    }
    showToast(state, "Socio registrado correctamente");
  }, [state]);

  return (
    <form className={cn("flex flex-col gap-6 lg:mx-[5%] xl:mx-[10%]", className)} action={formAction}>
      <h1 className="text-2xl font-bold text-center">Registra un socio</h1>

      <div className="flex flex-col justify-between">
        <Label className="mb-3" htmlFor="commission">Empresa</Label>
        <Select name="company_id" required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una empresa"/>
          </SelectTrigger>
          <SelectContent>
            {companies.map((item) =>
              <SelectItem 
                key={item.company_id}
                value={String(item.company_id)}
              >
                {`${item.company_name}`}
              </SelectItem>
            )}
            {!companies.length && (
              <SelectItem 
                disabled
                value="''"
              >
                No hay datos
              </SelectItem>
            )
            }
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="grid justify-items-start">
          <div className="w-[90%] flex flex-col justify-between">
            <Label className="mb-3" htmlFor="password">Nombre</Label>
            <Input
              type="text"
              onChange={handleChange}
              value={firstName}
              placeholder="Pepito"
              id="member_firstname"
              name="member_firstname"
              required
            />
          </div>
        </div>

        <div className="grid justify-items-end">
          <div className="w-[90%] flex flex-col justify-between">
            <Label className="mb-3" htmlFor="password">Apellido</Label>
            <Input
              type="text"
              value={lastName}
              onChange={handleChange}
              placeholder="Pérez"
              id="member_lastname"
              name="member_lastname"
              required
            />
          </div>
        </div>

      </div>
      <Button type="submit" className="w-full cursor-pointer" disabled={pending}>
        Registrar socio
      </Button>
    </form>
  );
}
