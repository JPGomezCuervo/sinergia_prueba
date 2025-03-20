"use server";
import { columns } from "./columns.jsx";
import { DataTable } from "@/components/ui/data-table.jsx";
import { getCurrentUserID, getProductsAndCompanies } from "@/lib/actions";

export default async function DashboardPage() {
  let userID = null;
  let products = [];
  const action = {
    name: "Añadir producto",
    href: "/dashboard/crear/productos",
  };

  try {
    const requestID = await getCurrentUserID();
    if(requestID.succeed) {

      userID = requestID.payload;

      const requestProducts = JSON.parse(await getProductsAndCompanies(userID));
      if(requestProducts.succeed) {
        products = requestProducts.payload;
      }
    }
  } catch(err) {
    console.log(err.message);
  }
  return (
    <div className="container mx-auto py-10">
      <DataTable action={action} columns={columns} data={products} />
    </div>
  );
}
