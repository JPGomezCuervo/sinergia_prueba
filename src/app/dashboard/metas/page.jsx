"use server";
import { columns } from "./columns.jsx";
import { DataTable } from "@/components/ui/data-table.jsx";
import { CardsSection } from "@/components/ui/cards-section";
import { months } from "@/lib/utils";
import { getCurrentUserID, getGoals } from "@/lib/actions";

export default async function DashboardPage() {
  let userID = null;
  let goals = [];
  const action = {
    name: "Añadir meta",
    href: "/dashboard/crear/metas",
  };

  try {
    const requestID = await getCurrentUserID();
    if(requestID.succeed) {

      userID = requestID.payload;

      const requestGoals = JSON.parse(await getGoals(userID));
      if(requestGoals.succeed) {
        goals = requestGoals.payload;
        goals.forEach(item => {
          const date = new Date(item.goal_created_at);
          item.goal_created_at = 
            date.toLocaleDateString("es-ES", { year: "numeric", month: "2-digit", day: "2-digit" });

          item.goal_month = months[item.goal_month];
          item.member_fullname = `${item.member_firstname} ${item.member_lastname}`;
        });
      }
    }
  } catch(err) {
    console.log(err.message);
  }
  return (
    <div className="container mx-auto py-10">
      <CardsSection />
      <DataTable action={action} columns={columns} data={goals} />
    </div>
  );
}
