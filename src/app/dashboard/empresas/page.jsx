"use server";

import { columns } from "./columns.jsx";
import { DataTable } from "@/components/ui/data-table.jsx";
import { CardsSection } from "@/components/ui/cards-section";
import { getCurrentUserID, getCompanies } from "@/lib/actions";

export default async function DashboardPage() {
  let userID = null;
  let companies = [];
  const action = {
    name: "Añadir empresa",
    href: "/dashboard/crear/empresas",
  };

  try {
    const requestID = await getCurrentUserID();
    if(requestID.succeed) {

      userID = requestID.payload;

      const requestCompanies = JSON.parse(await getCompanies(userID));
      if(requestCompanies.succeed) {
        companies = requestCompanies.payload;
      }
    }
  } catch(err) {
    console.log(err.message);
  }
  return (
    <div className="container mx-auto py-10">
      <CardsSection />
      <DataTable action={action} columns={columns} data={companies} />
    </div>
  );
}
