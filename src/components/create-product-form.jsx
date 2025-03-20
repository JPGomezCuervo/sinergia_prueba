"use client";

import { cn } from "@/lib/utils";
import { useActionState, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/lib/utils";
import { createProduct } from "@/lib/actions";
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
  companies,
}) {
  const pathname = usePathname();
  const pathnameArray = pathname.split("/");
  let id = "";

  if(!isNaN(pathnameArray[pathnameArray.length-1])) {
    id = pathnameArray[pathnameArray.length-1];
  }

  const initialState = {
    message: "",
  };
  const [charCount, setCharCount] = useState(0);
  const [companyID, setCompanyID] = useState(id);

  const [name, setName] = useState("");
  const [closing, setClosing] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");

  // TODO: Create Action
  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    let formClosingRate = formData.get("product_closing_rate");
    if(formClosingRate) {
      formClosingRate = formClosingRate.replace(/%/g, "");
      formClosingRate = parseInt(formClosingRate)/100;

      if(isNaN(formClosingRate)) 
        return {succeed: false, message: "No se ha podido crear el producto"};

      formData.set("product_closing_rate", formClosingRate );
    }

    return await createProduct(formData);
  }, initialState);


  function handleTextAreaChange(e) {
    setCharCount(e.target.value.length);
    setDescription(e.target.value);
  }

  function handlePercentageInputChange(e) {
    const input = e.target.value;

    if(/^0/.test(input))
      return;

    if(!/^[0-9]$/.test(input))
      e.target.value = input.replace(/\D/g, "");

    if(!/^[0-9]{1,3}$/.test(input))
      e.target.value = e.target.value.slice(0, e.target.value.length-1);


    if(Number(e.target.value) > 100)
      e.target.value = e.target.value.slice(0, e.target.value.length-1);


    setClosing(e.target.value);
  }

  function handleChange(e) {
    const input = e.target.value;
    if(!/^[0-9]$/.test(input))
      e.target.value = input.replace(/\D/g, "");

    if(e.target.name == "product_price")
      setPrice(e.target.value);

    if(e.target.name == "product_quantity")
      setQuantity(e.target.value);
  }

  function removePercentage(e) {
    e.target.value = e.target.value.slice(0, e.target.value.length-1);
    if(e.target.value == "0") {
      e.target.value = ""
    }
    setClosing(e.target.value);
  }

  function handlePercentage(e) {
    if(!e.target.value.length) {
      e.target.value = "0%";
    } else {
      e.target.value += "%";
    }
    setClosing(e.target.value);
  }


  useEffect(() => {
    if(state.succeed) {
      setName("");
      setClosing("");
      setPrice("");
      setQuantity("");
      setDescription("");
    }
    showToast(state, "Producto creado correctamente");
  }, [state]);

  return (
    <form className={cn("flex flex-col gap-6 lg:mx-[5%] xl:mx-[10%]", className)} action={formAction}>
      <h1 className="text-2xl font-bold text-center">Crea tu producto</h1>
      <div className="grid gap-6">

        <div className="grid gap-3">
          <Label htmlFor="name">Nombre de producto</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            id="product_name"
            type="name"
            name="product_name"
            placeholder="Producto 1"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="grid justify-items-start">
            <div className="w-[90%] flex flex-col justify-between">
              <Label className="mb-3" htmlFor="password">Tasa de cierre</Label>
              <Input
                pattern="^(?!0)\d+%$"
                type="text"
                onChange={handlePercentageInputChange}
                onBlur={handlePercentage}
                onFocus={removePercentage}
                value={closing}
                placeholder="100%"
                id="product_closing_rate"
                name="product_closing_rate"
                required
              />
            </div>
          </div>

          <div className="grid justify-items-end">
            <div className="w-[90%] flex flex-col justify-between">
              <Label className="mb-3" htmlFor="password">Precio de Producto en ARS</Label>
              <Input
                onChange={handleChange}
                value={price}
                placeholder="850"
                id="product_price"
                name="product_price"
                required
              />
            </div>
          </div>

          <div className="w-[90%] flex flex-col justify-between">
            <Label htmlFor="commission">Empresa</Label>
            <Select value={companyID}
              onValueChange={(e) => setCompanyID(e)}
              name="company_id"
              required
            >
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

          <div className="grid justify-items-end">
            <div className="w-[90%] flex flex-col justify-between">
              <Label className="mb-3" htmlFor="password">Cantidad de producto</Label>
              <Input
                onChange={handleChange}
                value={quantity}
                placeholder="6"
                id="product_quantity"
                name="product_quantity"
                required
              />
            </div>
          </div>

        </div>

        <div className="w-[100%]">
          <Label className="mb-3" htmlFor="password">Descripción del  producto</Label>
          <Textarea
            maxLength="150"
            className="h-30 resize-y md:resize-none"
            id="product_description"
            name="product_description"
            value={description}
            onChange={handleTextAreaChange}
            placeholder="Descripción del producto..."
          />
          <div className=" text-right text-sm text-muted-foreground">
            {charCount}/150
          </div>
        </div>

        <Button type="submit" className="w-full cursor-pointer" disabled={pending}>
          Generar producto
        </Button>

      </div>
    </form>
  );
}
