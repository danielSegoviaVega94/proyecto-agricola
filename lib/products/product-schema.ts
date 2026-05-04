import { z } from "zod";

export const priceTierSchema = z.object({
  minQuantity: z.number().min(0, "La cantidad mínima debe ser 0 o mayor."),
  pricePerUnit: z.number().positive("El precio por unidad debe ser mayor a 0."),
});

export const createProductSchema = z
  .object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
    description: z.string().min(3, "La descripción debe tener al menos 3 caracteres."),
    categoryId: z.string().min(1, "Selecciona una categoría válida."),
    measureUnit: z.enum(["kg", "unit", "box", "bag", "liter"]),
    stock: z.number().min(0, "El stock no puede ser negativo."),
    comuna: z.string().min(2, "La comuna es obligatoria."),
    priceTiers: z.array(priceTierSchema).min(1, "Debes agregar al menos un tramo de precio."),
    imagePaths: z.array(z.string().min(1)).default([]),
  })
  .superRefine((value, context) => {
    const seen = new Set<number>();

    value.priceTiers.forEach((tier, index) => {
      if (seen.has(tier.minQuantity)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["priceTiers", index, "minQuantity"],
          message: "No se permiten cantidades mínimas duplicadas.",
        });
      }
      seen.add(tier.minQuantity);

      if (index === 0) {
        return;
      }

      const previous = value.priceTiers[index - 1];
      if (previous && tier.minQuantity <= previous.minQuantity) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["priceTiers", index, "minQuantity"],
          message: "Los tramos deben ir en orden ascendente.",
        });
      }
    });
  });

export type CreateProductInput = z.infer<typeof createProductSchema>;
