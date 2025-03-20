"use client";

import {  HandCoins } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ResultSimulation } from "@/components/ui/result-simulation";
import { TodaySimulation } from "@/components/ui/today-simulation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getProducts, getMembers, getCurrencyRate, createGoal } from "@/lib/actions";
import { Label } from "@/components/ui/label";
import {
  cn,
  showToast,
  haveToSell,
  goalSalesInUSD,
  totalMonthlySales,
  months,
  calculateProspectsNeeded,
  minimumMonthlyPresentations,
  minimumWeeklyPresentations
} from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateForm({
  userID,
  commissions,
  vat,
  companies,
  className,
}) {

  const initialState = {
    message: "",
  };

  const [products, setProducts] = useState([]);
  const [members, setMembers] = useState([]);

  const [ticketCost, setTicketCost] = useState("");
  const [todayProfit, setTodayProfit] = useState(0);
  const [rate, setRate] = useState("");
  const [checkbox, setCheckbox] = useState(false);
  const [skip, setSkip] = useState(false);
  const [product, setProduct] = useState({
    product_price: 0,
    product_closing_rate: 0,
  });
  const [goal, setGoal] = useState("");
  const [userhavetoSell, setuserHavetoSell] = useState(0);
  const [volume, setVolume] = useState(0);
  const [total, setTotal] = useState(0);

  const [newData, setNewData] = useState(0);
  const [monthPres, setMonthPres] = useState(0);
  const [weekPres, setWeekPres] = useState(0);
  const [month, setMonth] = useState("");

  const [commission, setCommission] = useState({
    commission_value: 1,
    commission_factor: 1
  });

  const [disableTicket, setDisableTicket] = useState(false);

  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    setSkip(true);
    const month = formData.get("goal_month");
    formData.append("goal_rate", rate);
    formData.set("goal_month", Number(month) + 1);
    formData.set("product_id", product.product_id);
    formData.set("commission_id", commission.commission_id);
    formData.set("user_id", userID);
    return await createGoal(formData);
  }, initialState);

  function handleProductChange(value) {
    setProduct(products[value]);
  }

  function handleCommissionChange(value) {
    setCommission(commissions[value]);
  }

  function handleChange(e) {
    const input = e.target.value;
    if(!/^[0-9]*$/.test(input))
      e.target.value = input.replace(/\D/g, "");
    

    if(e.target.name == "goal_rate") {
      setRate(e.target.value);
      return;
    }
    

    if(e.target.name == "goal_avg_ticket") {
      setTicketCost(e.target.value);
      return;
    }


    if(e.target.name == "goal_goal") {
      setGoal(e.target.value);
      return;
    }
  }

  async function handleCheckbox(value) {
    try {
      if(skip) {
        setCheckbox(true);
        setSkip(false);
        return;
      }
      setCheckbox(value);
      if(value) {
        setDisableTicket(true);
        const request = await getCurrencyRate("ARS");
        if(request.succeed) {
          setRate(String(request.payload));
        } else {
          showToast({succeed: false, message: request.message});
        }
        return 0;
      } 
      setDisableTicket(false);
      setRate("");
    } catch(err) {
      showToast({succeed: false, message: err.message});
    }
  }

  async function handleCompany(id) {
    try {
      const products_request = JSON.parse(await getProducts(Number(id)));
      if(products_request.succeed) {
        setProducts(products_request.payload);
      } else {
        showToast({succeed: false, message: products_request.message});
      }

      const members_request = JSON.parse(await getMembers(Number(userID)));
      if(members_request.succeed) {
        const filtered_members = members_request.payload.filter(item => 
          item.company_id == id
        );
        
        setMembers(filtered_members);
      } else {
        showToast({succeed: false, message: members_request.message});
      }

    } catch(err) {
      showToast({succeed: false, message: err.message});
    }
  }

  // Crear tarjeta que contiene el resultado de: (product_value*(vat+1))*commision_value
  useEffect(() => {showToast(state, "Meta creada correctamente");}, [state]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if(ticketCost && product.product_id && rate && commission.commission_id && goal) {
        createSimulation();
      }
    }, 500);
    return () => clearTimeout(timer);
  },[ticketCost, month, product, rate, commission, goal]);

  function createSimulation() {
    let value = ((product.product_price / (vat + 1)) * commission.commission_value);
    let operation = Math.round(value);
    const volumeRate = rate ? Number(rate) : 1;
    const ticketAvg = ticketCost ? Number(ticketCost) : 1;
    const userhavetoSell = haveToSell(Number(goal), vat, commission.commission_factor);
    const salesVolume = goalSalesInUSD(userhavetoSell, volumeRate);
    const monthSales = totalMonthlySales(salesVolume, ticketAvg);
    const minimumMonth = minimumMonthlyPresentations(monthSales, product.product_closing_rate);

    setuserHavetoSell(Math.round(userhavetoSell));
    setVolume(Math.round(salesVolume));
    setTotal(Math.round(monthSales));
    setNewData(Math.round(calculateProspectsNeeded(monthSales)));
    setMonthPres(Math.round(minimumMonth));
    setWeekPres(Math.round(minimumWeeklyPresentations(minimumMonth)));

    setTodayProfit(operation);
    showToast({succeed: true}, "Se generó tu plan de acción");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  return (
    <form className={cn("flex flex-col gap-6 lg:mx-[5%] xl:mx-[10%]", className)} action={formAction}>
      <h1 className="text-2xl font-bold text-center">Asistente de metas mensuales</h1>
      <div className="grid gap-6">

        <div>
          <Label className="mb-3" htmlFor="goal_goal">¿Cuánto quieres ganar este mes?</Label>
          <Input
            className=""
            onChange={handleChange}
            value={goal}
            placeholder="1500"
            id="goal_goal"
            name="goal_goal"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="w-[90%]">
            <Label className="w-fit mb-3" htmlFor="company_id">Empresa</Label>
            <Select onValueChange={handleCompany} id="company_id" name="company_id" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una empresa"/>
              </SelectTrigger>
              <SelectContent>
                {companies.map((item) =>
                  <SelectItem 
                    className="cursor-pointer"
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
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="w-[90%] ml-auto">
              <Label className="w-fit mb-3" htmlFor="goal_month">Mes</Label>
              <Select onValueChange={(value) => setMonth(months[value])} name="goal_month" required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un mes"/>
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) =>
                    <SelectItem 
                      className="cursor-pointer"
                      key={index}
                      value={String(index)}
                    >
                      {month}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="w-[90%]">
            <Label className="w-fit mb-3" htmlFor="member_id">Socio</Label>
            <Select id="member_id" name="member_id" required>
              <SelectTrigger className="w-full ">
                <SelectValue placeholder="Seleccion un socio"/>
              </SelectTrigger>
              <SelectContent>
                {members.map((item) =>
                  <SelectItem 
                    className="cursor-pointer"
                    key={item.member_id}
                    value={String(item.member_id)}
                  >
                    {`${item.member_firstname} ${item.member_lastname}`}
                  </SelectItem>
                )}
                {!members.length && (
                  <SelectItem 
                    disabled
                    value="''"
                  >
                    No hay datos
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid justify-items-end">
            <div className="w-[90%]">
              <Label className="mb-3" htmlFor="goal_avg_ticket">Costo de ticket promedio (USD)</Label>
              <Input
                onChange={handleChange}
                placeholder="20"
                id="goal_avg_ticket"
                name="goal_avg_ticket"
                value={ticketCost}
                required
              />
            </div>
          </div>

          <div className="w-[90%]">
            <Label className="w-fit mb-3" htmlFor="commission_id">Comisión actual</Label>
            <Select onValueChange={handleCommissionChange} id="commission_id" name="commission_id" required>
              <SelectTrigger className="w-full ">
                <SelectValue placeholder="Selecciona un porcentaje"/>
              </SelectTrigger>
              <SelectContent>
                {commissions.map((item, index) =>
                  <SelectItem 
                    className="cursor-pointer"
                    key={index}
                    value={String(index)}
                  >
                    {`${item.commission_value*100.}%`}
                  </SelectItem>
                )}
                {!commissions.length && (
                  <SelectItem 
                    disabled
                    value="''"
                  >
                    No hay datos
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="w-[90%] ml-auto">
              <Label className="w-fit mb-3" htmlFor="product_id">Producto</Label>
              <Select onValueChange={handleProductChange} name="product_id" required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un producto"/>
                </SelectTrigger>
                <SelectContent>
                  {products.map((item, index) => 
                    <SelectItem
                      className="cursor-pointer"
                      key={item.product_id}
                      value={String(index)}
                    >
                      {item.product_name}
                    </SelectItem>
                  )}
                  {!products.length && (
                    <SelectItem 
                      disabled
                      value="''"
                    >
                      No hay datos
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="w-full">
          <Label className="mb-3" htmlFor="goal_rate">Tasa de cambio 1 USD =</Label>
          <Input
            className="mb-2 disabled:opacity-50 !opacity-100"
            disabled={disableTicket}
            onChange={handleChange}
            value={rate}
            placeholder="1500"
            id="goal_rate"
            name="goal_rate"
            required
          />
          <div className="flex items-center space-x-2">
            <Checkbox 
              onCheckedChange={handleCheckbox}
              value={checkbox}
              id="realtime_value"
            />
            <label
              htmlFor="realtime_value"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Utilizar valor en tiempo real
            </label>
          </div>
        </div>

        <Card className="relative ml-auto pt-4 block w-full h-33">
          <CardHeader className="flex md:px-6 mb-4 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base md:text-base font-medium">
              <p>Tu ganancia neta hoy</p>
            </CardTitle>
            <HandCoins className="absolute top-5 right-2" color="var(--muted-foreground)"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-4xl font-bold">
              {todayProfit.toLocaleString("es-ES")}<span className="text-xs">ARS</span></div>
          </CardContent>
        </Card>

        {todayProfit ? (
          <>
            <ResultSimulation month={month} volume={volume} userhavetoSell={userhavetoSell} total={total}/>
            <TodaySimulation className="mt-10" data={newData} monthPres={monthPres} weekPres={weekPres}/>
          </>
        ): <></>}

        <Button type="submit" className="w-full cursor-pointer" disabled={pending}>
          Generar meta
        </Button>

      </div>
    </form>
  );
}
