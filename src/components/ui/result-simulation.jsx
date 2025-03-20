import { DollarSign, Package, GlassWater } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ResultSimulation({
  month,
  userhavetoSell,
  volume,
  total,
}) {
  return (
    <>
      <h1 className="text-xl mt-20 font-bold text-center">Tu plan de acción de {month}</h1>
      <div className="grid  grid-cols-2 gap-3 justify-center sm:justify-between">
        <Card className="relative block w-full h-33">
          <CardHeader className="flex mb-4 pl-4 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm md:text-lg font-medium">
              <p className="whitespace-pre-line">{"Tienes que vender"}</p>
            </CardTitle>
            <DollarSign className="absolute top-2 right-2" color="var(--muted-foreground)"/>
          </CardHeader>
          <CardContent className="pl-4">
            <div className="text-lg md:text-3xl font-bold">
              {userhavetoSell.toLocaleString("es-ES", {useGrouping: true})} <span className="text-xs">ARS</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative block w-full h-33">
          <CardHeader className="flex mb-3 pr-0 pl-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm pr-6 md:text-lg font-medium">
              <p className="whitespace-pre-line">{"Sumará un volumen en carrera"}</p>
            </CardTitle>
            <GlassWater className="absolute top-2 right-1" color="var(--muted-foreground)"/>
          </CardHeader>
          <CardContent className="pl-4">
            <div className="text-lg md:text-3xl font-bold">
              {volume.toLocaleString("es-ES", {useGrouping: true})} <span className="text-xs">USD</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="relative block w-full h-33 ">
        <CardHeader className="flex mb-3 pl-4 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm md:text-lg font-medium">
            <p className="whitespace-pre-line">{"Total de ventas en el mes "}</p>
          </CardTitle>
          <Package className="absolute top-5 right-3" color="var(--muted-foreground)"/>
        </CardHeader>
        <CardContent className="pl-4">
          <div className="text-xl md:text-3xl font-bold">{total.toLocaleString("es-ES", {useGrouping: true})}</div>
        </CardContent>
      </Card>
    </>
  );
}
