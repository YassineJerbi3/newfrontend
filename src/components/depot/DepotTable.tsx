import { DepotItem } from "@/hooks/useDepotData";
import { Package, AlertTriangle } from "lucide-react";

interface DepotTableProps {
  equipments: DepotItem[];
}

export function DepotTable({ equipments }: DepotTableProps) {
  if (equipments.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Aucun équipement dans le dépôt
        </h3>
        <p className="text-gray-500">
          Commencez par ajouter un bon d'entrée pour voir vos équipements ici.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Équipements en dépôt
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {equipments.length} équipement(s) au total dans le dépôt
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Désignation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Quantité
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {equipments.map((item, index) => {
              const isLowStock =
                item.typeConsommable &&
                item.quantite <= item.typeConsommable.stockAlerte;

              return (
                <tr
                  key={item.id}
                  className={`transition-colors hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {item.designation}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {item.typeConsommable?.name || "Non défini"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <span
                      className={`text-sm font-semibold ${
                        isLowStock ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {item.quantite}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    {isLowStock ? (
                      <div className="flex items-center justify-center">
                        <AlertTriangle className="mr-1 h-4 w-4 text-red-500" />
                        <span className="text-xs font-medium text-red-600">
                          Stock faible
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Disponible
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
