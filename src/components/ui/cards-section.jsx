import { Building2, PackageSearch, ChartSpline } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardTitle,
} from "@/components/ui/card";

export function CardsSection() {
  const router = [
    {
      name: <div><p>Crear</p><p>Empresa</p></div>,
      href: "/dashboard/crear/empresas",
      icon: <Building2 size="40" className="mx-auto"/>
    },
    {
      name: <div><p>Crear</p><p>Productos</p></div>,
      href: "/dashboard/crear/productos",
      icon: <PackageSearch size="40" className="mx-auto"/>
    },
    {
      name: <div><p>Crear</p><p>Metas</p></div>,
      href: "/dashboard/crear/metas",
      icon: <ChartSpline size="40" className="mx-auto"/>
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-[3vw] mb-5">
      {router.map((item, index) => {
        return (
          <Link className=" max-h-40 h relative" key={index} href={item.href}>
            <Card className="hover:bg-[var(--accent)] size-full shadow-none">
              {
                item.icon
              }
              <CardTitle>
                <span className="text-center text-xs md:text-base">
                  {item.name}
                </span>
              </CardTitle>
            </Card>
          </Link>
        );
      })
      }
    </div>
  );
}
