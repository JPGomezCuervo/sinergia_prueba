import { Database, Calendar1, CalendarDays } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TodaySimulation({
  data,
  monthPres,
  weekPres,
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 justify-center sm:justify-between">
        <Card className="relative block w-full h-33">
          <CardHeader className="flex pl-4 mb-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm md:text-lg font-medium">
              <p className="whitespace-pre-line md:whitespace-normal">{"Nuevos datos a \n prospectar"}</p>
            </CardTitle>
            <Database className="absolute top-4 right-1" color="var(--muted-foreground)"/>
          </CardHeader>
          <CardContent className="pl-4">
            <div className="text-2xl md:text-3xl font-bold">{data.toLocaleString("es-ES", {useGrouping: true})}</div>
          </CardContent>
        </Card>

        <Card className="relative block w-full h-33">
          <CardHeader className="flex pl-3 mb-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm md:text-lg font-medium">
              <p className="whitespace-pre-line md:whitespace-normal">{"Presentaciones \n mínimas por mes"}</p>
            </CardTitle>
            <Calendar1 className="absolute top-5 right-3" color="var(--muted-foreground)"/>
          </CardHeader>
          <CardContent className="pl-3">
            <div className="text-2xl md:text-3xl font-bold">{monthPres.toLocaleString("es-ES", {useGrouping: true})}</div>
          </CardContent>
        </Card>
      </div>
      <Card className="relative block w-full h-33">
        <CardHeader className="flex mb-3 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm md:text-lg font-medium">
            <p className="whitespace-pre-line md:whitespace-normal">{"Presentaciones \n mínimas por semana"}</p>
          </CardTitle>
          <CalendarDays className="absolute top-5 right-3" color="var(--muted-foreground)"/>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold">{weekPres.toLocaleString("es-ES", {useGrouping: true})}</div>
        </CardContent>
      </Card>
    </>
  );
}
