"use server";
import { CreateForm } from "@/components/create-simulation-form";
import {
  getCurrentUserID,
  getVAT,
  getCompanies,
  getCommissions
} from "@/lib/actions";

export default async function DashboardCreateProductPage() {
  let userID = null;
  let companies = [];
  let commissions = [];
  let vat = 0;

  try {
    const requestVat = await getVAT();
    if(requestVat.succeed) {
      vat = requestVat.payload;
    }

    const requestComissions = JSON.parse(await getCommissions());
    if(requestComissions.succeed) {
      commissions = requestComissions.payload;
    }

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
    <div>
      <CreateForm userID={userID} vat={vat} commissions={commissions} companies={companies} />
    </div>
  );
}
