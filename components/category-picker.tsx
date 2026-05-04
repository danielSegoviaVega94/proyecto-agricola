import type { CategoryTreeNode } from "@/lib/categories/get-category-tree";
import type { SelectHTMLAttributes } from "react";

type CategoryPickerProps = {
  categories: CategoryTreeNode[];
  name?: string;
  selectProps?: SelectHTMLAttributes<HTMLSelectElement>;
};

export function CategoryPicker({ categories, name = "category_id", selectProps }: CategoryPickerProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-[#4a4a4a]">
        Categoría
      </label>
      <select
        id={name}
        name={name}
        {...selectProps}
        className="h-12 w-full rounded-xl border border-[#e8e6e0] px-4 text-base outline-none focus:border-[#16803c]"
      >
        <option value="">Selecciona una categoría</option>
        {categories.map((parent) => (
          <optgroup key={parent.id} label={parent.name}>
            {parent.children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
