export interface interfaces {}

export interface ResponseData<Data> {
  data: Data;
}

export interface INoticeProps {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  description: string;
}

export interface IResponseCSV {
  data: {
    domain: string;
    fileName: string;
  };
}

export interface IActor {
  id: number;
  key: string;
  value: string;
  description: null;
  metadata: {
    avatar: string;
    katakana: string;
  };
}

export interface IIndustry {
  id?: number;
  key: string;
  value: string;
}

export interface IPagination {
  hasMore: boolean;
  pageIndex: number;
  totalItems: number;
  totalPages: number;
}
