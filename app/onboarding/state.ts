export type OnboardingActionState = {
  status: "idle" | "success" | "error";
  message: string;
  redirectTo: string | null;
};

export const initialOnboardingState: OnboardingActionState = {
  status: "idle",
  message: "",
  redirectTo: null,
};
