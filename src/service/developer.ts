import { getVoltronDeveloperAnalyzeRepositories, getVoltronProjectDetail } from '@/api';

function createService() {
  const caches = {
    repoAnalyzePayload: null as RepoAnalyzePayload | null
  };

  const weakCaches = new WeakMap<RepoAnalyzePayload, RepoAnalyzeResult>();

  async function fetchRepoAnalyzePayload(force = false): Promise<RepoAnalyzePayload | null> {
    try {
      if (caches.repoAnalyzePayload && !force) {
        return caches.repoAnalyzePayload;
      }
      const searchParams = new URL(window.location.href).searchParams;
      const projectId = searchParams.get('projectId');
      if (!projectId) {
        throw new Error('projectId is required');
      }
      const res = await getVoltronProjectDetail({
        projectId
      });
      const { customCodeRepoBranch, customCodeRepoComponentPath, customCodeRepoSlug } = res.data as any;
      if (!customCodeRepoSlug) {
        return null;
      } else {
        caches.repoAnalyzePayload = {
          repository: customCodeRepoSlug,
          componentsPath: customCodeRepoComponentPath,
          ref: customCodeRepoBranch
        };
        return caches.repoAnalyzePayload;
      }
    } catch (error) {
      console.error('error_in_fetch_repo_analyze_payload', error);
      return null;
    }
  }

  async function fetchRepoAnalyzeResult(payload: RepoAnalyzePayload, force = false): Promise<RepoAnalyzeResult | null> {
    if (weakCaches.has(payload) && !force) {
      return weakCaches.get(payload);
    }
    const res = await getVoltronDeveloperAnalyzeRepositories(payload);
    const data = Object.values(res.data).map((item: { name: string; dependency: string }) => ({
      label: item.name,
      value: item.name,
      dependency: item.dependency
    }));
    weakCaches.set(payload, data);
    return data;
  }

  async function fetchReplaceComponentList(force = false) {
    try {
      const repoAnalyzePayload = await fetchRepoAnalyzePayload(force);
      if (!repoAnalyzePayload) {
        return [];
      }
      const repoAnalyzeResult = await fetchRepoAnalyzeResult(repoAnalyzePayload, force);
      console.debug('repoAnalyzeResult', repoAnalyzeResult);
      return repoAnalyzeResult;
    } catch (error) {
      console.error('error_in_fetch_replace_component_list', error);
    }
    return [];
  }

  return {
    fetchReplaceComponentList
  };
}

export const DeveloperService = createService();

type RepoAnalyzePayload = {
  repository: string;
  componentsPath: string;
  ref: string;
};

type RepoAnalyzeResult = ReplaceComponentSelectOption[];

export interface ReplaceComponentSelectOption {
  label: string;
  value: string;
  dependency: string;
}
