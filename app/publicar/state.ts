export type CreateProductState = {
  status: "idle" | "success" | "error";
  message: string;
  redirectTo: string | null;
};

export const initialCreateProductState: CreateProductState = {
  status: "idle",
  message: "",
  redirectTo: null,
};
