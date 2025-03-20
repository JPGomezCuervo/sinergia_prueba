"use client";
import { TableAction } from "@/components/ui/tableAction";

export const columns = [
  {
    id: "actions",
    cell: ({ row }) => <TableAction row={row} action="delete_goal" secondAction="details_goal"/>,
  },
  {
    accessorKey: "goal_created_at",
    header: "Fecha",
  },
  {
    accessorKey: "goal_month",
    header: "Mes",
  },
  {
    accessorKey: "goal_avg_ticket",
    header: "Precio Ticket (USD)",
  },
  {
    accessorKey: "goal_rate",
    header: "Tasa de cambio",
  },
  {
    accessorKey: "goal_goal",
    header: "Meta",
  },
  {
    accessorKey: "company_name",
    header: "Empresa",
  },
];
