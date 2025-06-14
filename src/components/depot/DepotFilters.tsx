import { EquipmentType } from "@/hooks/useDepotData";
import { Filter } from "lucide-react";

interface DepotFiltersProps {
  types: EquipmentType[];
  filterType: string;
  onFilterChange: (value: string) => void;
}

export function DepotFilters({ types, filterType, onFilterChange }: DepotFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtrer par type de dépôt</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange("")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === ""
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tous les types
          </button>
          
          {types.map((type) => (
            <button
              key={type.id}
              onClick={() => onFilterChange(type.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === type.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}