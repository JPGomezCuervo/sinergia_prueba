"use server";
import { columns } from "./columns.jsx";
import { DataTable } from "@/components/ui/data-table.jsx";
import { CardsSection } from "@/components/ui/cards-section";
import { getCurrentUserID, getMembers } from "@/lib/actions";

export default async function DashboardPage() {
  let userID = null;
  let members = [];
  const action = {
    name: "Añadir socio",
    href: "/dashboard/crear/socios",
  };

  try {
    const requestID = await getCurrentUserID();
    if(requestID.succeed) {

      userID = requestID.payload;

      const requestMembers = JSON.parse(await getMembers(userID));
      if(requestMembers.succeed) {
        members = requestMembers.payload;
      }
    }
  } catch(err) {
    console.log(err.message);
  }
  return (
    <div className="container mx-auto py-10">
      <CardsSection />
      <DataTable action={action} columns={columns} data={members} />
    </div>
  );
}
