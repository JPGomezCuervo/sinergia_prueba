"use client";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProduct, deleteCompany, deleteMember, deleteGoal } from "@/lib/actions";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TableAction({row, action, secondAction}) {
  const record = row.original;
  const router = useRouter();

  const name = (function() {
    switch(action) {
    case "delete_product":
      return "Eliminar Producto";
    case "delete_company":
      return "Eliminar Empresa";
    case "delete_goal":
      return "Eliminar Meta";
    case "delete_member":
      return "Eliminar Socio";
    default:
      return "Eliminar Item";
    }
  })();

  const secondName = (function() {
    switch(secondAction) {
    case "details_goal":
      return "Ver detalles";
    default:
      return "";
    }
  })();

  async function handleOnClick(numAction) {
    let request = null;
    try {
      if(numAction == action) {
        switch(action) {
        case "delete_product":
          request = await deleteProduct(record.product_id);
          break;
        case "delete_company":
          request = await deleteCompany(record.company_id);
          break;
        case "delete_member":
          request = await deleteMember(record.member_id);
          break;
        case "delete_goal":
          request = await deleteGoal(record.goal_id);
          break;
        default:
          request = { succeed: false, message: "Error al ejecutar acción"};
          return;
        }
      }

      if(numAction == secondAction) {
        switch(secondAction) {
        case "details_goal":
          request = router.push(`/dashboard/metas/detalles/${record.goal_id}`);
          return;
        default:
          request = { succeed: false, message: "Error al ejecutar acción"};
          return;
        }
      }


      showToast(request, "Acción completada correctamente");
      router.refresh();
    } catch(err) {
      showToast({succeed: false, message: err.message}, "");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {name &&
          <DropdownMenuItem onClick={() => handleOnClick(action)} className="cursor-pointer text-red-500">{name}</DropdownMenuItem>
        }

        {secondName &&
          <DropdownMenuItem onClick={() => handleOnClick(secondAction)} className="cursor-pointer">{secondName}</DropdownMenuItem>
        }
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
