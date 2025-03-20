"use server";
import { TodaySimulation } from "@/components/ui/today-simulation";
import { ResultSimulation } from "@/components/ui/result-simulation";
import { getGoalByID, getCommissions, getProductByID, getVAT } from "@/lib/actions";
import { months } from "@/lib/utils";
import { redirect } from "next/navigation";
import {
  haveToSell,
  goalSalesInUSD,
  totalMonthlySales,
  calculateProspectsNeeded,
  minimumMonthlyPresentations,
  minimumWeeklyPresentations
} from "@/lib/utils";

export default async function GoalsDetails({params}) {
  let data = 0;
  let monthPres = 0;
  let weekPres = 0;
  let userhavetoSell = 0;
  let volume = 0;
  let total = 0;
  let month = "";

  try {
    const { id } = await params;
    if(!id) {
      return redirect("/dashboard");
    }

    let goal = {};
    let vat = 0;
    let commission = 0;
    let product = 0;

    const requestGoal = JSON.parse(await getGoalByID(Number(id)));
    if(requestGoal.succeed) {
      goal = requestGoal.payload;
    }

    const requestCommission = JSON.parse(await getCommissions());
    if(requestCommission.succeed) {
      for(let item of requestCommission.payload) {
        if(item.commission_id == goal.commission_id) {
          commission = item;
          break;
        }
      }
    }

    const requestProduct = JSON.parse(await getProductByID(goal.product_id));
    if(requestProduct.succeed) {
      product = requestProduct.payload;
    }

    const requestVat = await getVAT();
    if(requestVat.succeed) {
      vat = requestVat.payload;
    }

    const volumeRate = goal.goal_rate;
    const ticketAvg = goal.goal_avg_ticket;
    userhavetoSell = haveToSell(goal.goal_goal, vat, commission.commission_factor);
    const salesVolume = goalSalesInUSD(userhavetoSell, volumeRate);
    const monthSales = totalMonthlySales(salesVolume, ticketAvg);
    const minimumMonth = minimumMonthlyPresentations(monthSales, product.product_closing_rate);

    month = months[goal.goal_month - 1];
    volume = Math.round(salesVolume);
    userhavetoSell = Math.round(userhavetoSell);
    total = Math.round(monthSales);

    data = Math.round(calculateProspectsNeeded(monthSales));
    monthPres = Math.round(minimumMonth);
    weekPres = Math.round(minimumWeeklyPresentations(minimumMonth));

  } catch(err) {
    console.log(err.message);
  }

  return (
    <>
      <ResultSimulation month={month} volume={volume} userhavetoSell={userhavetoSell} total={total}/>
      <TodaySimulation className="mt-10" data={data} monthPres={monthPres} weekPres={weekPres}/>
    </>
  );
}
