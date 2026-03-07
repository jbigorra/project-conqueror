export type VCSEntry = {
  author: string;
  entity: string;
  rev: string | number;
  date?: string;
  locAdded?: string;
  locDeleted?: string;
  message?: string;
};

export type AnalysisOptions = {
  minRevs: number;
  minSharedRevs: number;
  minCoupling: number;
  maxCoupling: number;
  maxChangesetSize: number;
};
