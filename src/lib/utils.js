import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ErrorCodes, errorMessages } from "@/lib/errors";
import { toast } from "sonner";

/* front */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export function showToast(state, message) {
  if(!state)
    return false;

  if(state.succeed === false) {
    toast.error(state.message, {
      classNames: {
        title: "text-lg"
      }
    });
    return false;
  }

  if(state.succeed === true) {
    toast.success(message, {
      classNames: {
        title: "text-lg"
      }
    });
    return true;
  }
}

/* BUSINESS LOGIC */

/* sheet: (B14 * 1.21) * factor | L14 || E14 */
export function calculateSalesTarget(goalInPesos, vatRate, salesMultiplier) {
  const totalWithVAT = goalInPesos * (1 + vatRate);
  const salesTarget = totalWithVAT * salesMultiplier;
  return salesTarget;
}

/* sheet: L14/C6 | L15  AND sheet: E14/C6 | E15 same calculation*/
export function convertSalesGoalInUSD(salesTargetInPesos, exchangeRate) {
  return salesTargetInPesos / exchangeRate;
}

/* sheet: L15/C5 | L16 */
export function calculateMonthlyTickets(volumeInUSD, averageTicketUSD) {
  return volumeInUSD / averageTicketUSD;
}

/* sheet: L16 * 6 | L19 */
export function calculateProspectsNeeded(monthlyTicketCount) {
  return monthlyTicketCount * 6;
}


/* sheet: E15/C5 | E16*/
export function calculateTicketsFromSalesTarget(salesTargetInUSD, averageTicketUSD) {
  return salesTargetInUSD / averageTicketUSD;
}

/* sheet: E16/E11 | E20 */
export function calculateUnitsPerTargetGoal(ticketFromSales, closingRate) {
  return ticketFromSales / closingRate;
}

/* sheet: E20/25 | E21 */
export function calculateMonthlyPresentations(ratioUnitsPerTargetGoal) {
  return ratioUnitsPerTargetGoal / 25;
}

/* (L20/4) + 1 | L21 */
export function calculateWeeklyPresentations(presentationsMonth) {
  return (presentationsMonth / 4) + 1;
}

/* Wrappers to make everything easy */
/* Call the functions in the order suggested 1, 2, 3, 4, 5, 6 */

/* 1 L14*/
export function haveToSell(goalInPesos, vatRate, salesMultiplier) {
  return calculateSalesTarget(goalInPesos, vatRate, salesMultiplier);
}

/* 2 L15*/
export function goalSalesInUSD(res_haveToSell, exchangeRate) {
  return convertSalesGoalInUSD(res_haveToSell, exchangeRate);
}

/* 3 L16*/
export function totalMonthlySales(res_goalSalesInUSD, avgTicket) {
  return calculateTicketsFromSalesTarget(res_goalSalesInUSD, avgTicket);
}

/* 4  calculateProspectsNeeded L19*/
export function prospect(res_totalMonthlySales) {
  return calculateProspectsNeeded(res_totalMonthlySales);
}

/* 5 L20*/
export function minimumMonthlyPresentations(res_totalMonthlySales, closingRate) {
  return calculateUnitsPerTargetGoal(res_totalMonthlySales,  closingRate);
}

/* 6 L21*/
export function minimumWeeklyPresentations(res_minimumMonthlyPresentations) {
  return calculateWeeklyPresentations(res_minimumMonthlyPresentations);
}

/* back */
export function makeResponse(succeed, errorCode, payload) {

  if (arguments.length > 3) {
    console.error("[FUNCTION ERROR] makeResponse: Too many arguments, expected 1 to 3");
    return ErrorCodes.SERVER_ERROR;
  }


  if (succeed) {
    if (arguments.length === 1)
      return { succeed };
    else
      return { succeed, payload };
  } else {
    const message = errorMessages.get(errorCode);
    return { succeed, message };
  }
}

export function capitalize(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export class Logger {
  constructor(type) {
    this.type = type.toUpperCase();
  }

  info(functionName, ...args) {
    let msg = args.join(" ");
    console.info(`[${this.type} INFO] ${functionName}: ${msg}`);
  }

  warn(functionName, ...args) {
    let msg = args.join(" ");
    console.warn(`[${this.type} WARN] ${functionName}: ${msg}`);
  }

  error(functionName, ...args) {
    let msg = args.join(" ");
    console.error(`[${this.type} ERROR] ${functionName}: ${msg}`);
  }

  debug(functionName, ...args) {
    const stack = new Error().stack;
    let msg = args.join(" ");
    console.debug(`[${this.type} DEBUG] ${functionName}: ${msg}`);
    console.debug(stack);
  }
}
