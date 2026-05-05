export type SubmitRatingState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type SubmitReportState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialSubmitRatingState: SubmitRatingState = {
  status: "idle",
  message: "",
};

export const initialSubmitReportState: SubmitReportState = {
  status: "idle",
  message: "",
};
