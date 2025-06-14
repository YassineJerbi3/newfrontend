import { EquipmentType } from "@/hooks/useDepotData";
import { Package, AlertTriangle, TrendingUp, Archive } from "lucide-react";

interface DepotDashboardProps {
  summary: (EquipmentType & { total: number })[];
}

export function DepotDashboard({ summary }: DepotDashboardProps) {
  const totalItems = summary.reduce((sum, item) => sum + item.total, 0);
  const lowStockItems = summary.filter(
    (item) => item.total <= item.stockAlerte,
  );
  const totalTypes = summary.length;

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Items */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Total Articles Dépôt
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalItems}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Types Count */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Types Dépôt</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalTypes}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
            <Archive className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Stock Faible Dépôt
            </p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {lowStockItems.length}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Average Stock */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Moyenne/Type</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {totalTypes > 0 ? Math.round(totalItems / totalTypes) : 0}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Type Summary Cards */}
      {summary.map((item) => (
        <div
          key={item.id}
          className={`col-span-1 rounded-xl border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg ${
            item.total <= item.stockAlerte
              ? "border-red-200 bg-red-50"
              : "border-gray-200"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                item.total <= item.stockAlerte
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {item.name}
            </span>
            {item.total <= item.stockAlerte && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Stock dépôt</span>
              <span
                className={`text-2xl font-bold ${
                  item.total <= item.stockAlerte
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                {item.total}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Seuil d'alerte</span>
              <span className="text-sm font-medium text-gray-700">
                {item.stockAlerte}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs text-gray-600">
                <span>Stock</span>
                <span>
                  {Math.round(
                    (item.total / Math.max(item.stockAlerte * 2, 1)) * 100,
                  )}
                  %
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    item.total <= item.stockAlerte
                      ? "bg-red-500"
                      : item.total <= item.stockAlerte * 1.5
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (item.total / Math.max(item.stockAlerte * 2, 1)) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
