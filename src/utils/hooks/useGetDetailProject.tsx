// import { getStoreDetail } from "api/store";
import { getProjectDetail } from '@/api/client/project';
import queryKeys from '@/connstant/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

const useGetProjectDetail = () => {
  const { projectId } = useParams();

  const { data } = useQuery({
    queryKey: [queryKeys.projectDetail, projectId],
    queryFn: () => getProjectDetail(),
    keepPreviousData: true,
    enabled: projectId !== undefined,
  });

  return { data };
};

export default useGetProjectDetail;

export interface IDetailProject {
  id: number;
  memberCount: number;
  companyId: number | null;
  name: string;
  key: string;
  state: number;
  type: number;
  avatar: string | null;
  issueCount: number;
  projectIssueTypes: {
    id: number;
    name: string;
    backgroundColor: string;
    issueCount: number;
    description: string | null;
    order: number;
  }[];
  projectIssueStates: {
    id: number;
    name: string;
    backgroundColor: string;
    issueCount: number;
    description: string;
    order: number;
  }[];
  projectIssueCategories: {
    id: number;
    name: string;
    issueCount: number;
    byState: { [key: number]: number };
  }[];
  projectVersions: {
    id: number;
    name: string;
    issueCount: number;
    byState: { [key: number]: number };
  }[];
  userProject: {
    userId: number;
    projectId: number;
    role: number;
    status: number;
    createdAt: string;
    categoryIds?: number[];
  };
}
