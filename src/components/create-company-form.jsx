"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast, cn } from "@/lib/utils";
import { createCompany, getCurrentUserID, getCompanyByName } from "@/lib/actions";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export function CreateForm({
  className,
}) {

  const initialState = {
    message: "",
  };

  const [companyID, setCompanyID] = useState("");
  const [name, setName] = useState("");
  const [buttonDisable, setButtonDisable] = useState(true);

  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    const companyName = formData.get("company_name");
    const request = await getCurrentUserID();
    let user_id = null;
    if(request.succeed) {
      user_id = request.payload;
    } else {
      return { succeed: false, message: request.message };
    }

    formData.append("user_id", user_id);

    if (companyName.length === 0) {
      return { succeed: false, message: "La empresa debe tener un nombre"};
    } else {
      const requestCreate =  await createCompany(formData);
      if(requestCreate.succeed) {
        const requestGetCompany = JSON.parse(await getCompanyByName(name));
        if(requestGetCompany.succeed) {
          setCompanyID(requestGetCompany.payload.company_id);
        }
      }
      setButtonDisable(false);
      return requestCreate;
    }
  }, initialState);

  useEffect(() => {
    if(state.succeed) {
      setName("");
    }
    showToast(state, "Empresa creada correctamente");
  }, [state]);

  return (
    <div>
      <form className={cn("flex flex-col gap-6 lg:mx-[5%] xl:mx-[10%]", className)} action={formAction}>
        <h1 className="text-2xl font-bold text-center">Crea tu nueva empresa</h1>
        <div className="grid gap-6">

          <div className="grid gap-3">
            <Label htmlFor="company_name">Nombre de la empresa</Label>
            <Input
              onChange={(e) => setName(e.target.value)}
              value={name}
              id="company_name"
              type="company_name"
              name="company_name"
              placeholder="Empresa 1"
              required
            />
          </div>

          <Button type="submit" className="w-full cursor-pointer" disabled={pending}>
            Crear empresa
          </Button>
          <Button disabled={buttonDisable} type="button" className="cursor-pointer p-0"> 
            <Link className="w-[100%] py-2" href={`/dashboard/crear/productos/${companyID}`}> Agregar productos </Link> 
          </Button>
        </div>
      </form>
    </div>
  );
}
