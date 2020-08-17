import { CATALOG } from '@/config/types';
import { allHash } from '@/utils/promise';
import { CATALOG as CATALOG_ANNOTATIONS } from '@/config/labels-annotations';
import { findBy } from '@/utils/array';
import { clone } from '@/utils/object';
import { addParams } from '@/utils/url';

export const state = function() {
  const out = {
    loaded:          false,
    clusterRepos:    null,
    namespacedRepos: null,
    charts:          null,
    versionInfos:    {},
  };

  return out;
};

export const getters = {
  isLoaded(state) {
    return state.loaded;
  },

  repos(state) {
    const clustered = state.clusterRepos || [];
    const namespaced = state.namespacedRepos || [];

    return [...clustered, ...namespaced];
  },

  repo(state, getters) {
    return ({ repoType, repoName }) => {
      const ary = (repoType === 'cluster' ? state.clusterRepos : state.namespacedRepos);

      return findBy(ary, 'metadata.name', repoName);
    };
  },

  charts(state) {
    return state.charts?.slice();
  },

  chart(state) {
    return ({ repoType, repoName, chartName }) => {
      const chart = findBy(state.charts, {
        repoType, repoName, chartName
      });

      if ( chart ) {
        return clone(chart);
      }
    };
  },

  version(state, getters) {
    return ({
      repoType, repoName, chartName, versionName
    }) => {
      const chart = getters['chart']({
        repoType, repoName, chartName
      });

      const version = findBy(chart.versions, 'version', versionName);

      if ( version ) {
        return clone(version);
      }
    };
  }
};

export const mutations = {
  setRepos(state, { cluster, namespaced }) {
    state.clusterRepos = cluster;
    state.namespacedRepos = namespaced;
  },

  setCharts(state, charts) {
    state.charts = charts;
  },

  cacheVersion(state, { key, info }) {
    state.versionInfos[key] = info;
  }
};

export const actions = {
  async load({ getters, commit, dispatch }, { force } = {}) {
    if ( getters.isLoaded && force !== true ) {
      return;
    }

    let promises = {
      cluster:    dispatch('cluster/findAll', { type: CATALOG.CLUSTER_REPO }, { root: true }),
      namespaced: dispatch('cluster/findAll', { type: CATALOG.REPO }, { root: true }),
    };

    const hash = await allHash(promises);

    commit('setRepos', hash);

    const repos = getters['repos'];

    promises = [];
    for ( const repo of repos ) {
      promises.push(repo.followLink('index'));
    }

    const indexes = await Promise.all(promises);

    const charts = {};

    for ( let i = 0 ; i < indexes.length ; i++ ) {
      const obj = indexes[i];
      const repo = repos[i];

      for ( const k in obj.entries ) {
        for ( const entry of obj.entries[k] ) {
          addChart(charts, entry, repo);
        }
      }
    }

    commit('setCharts', Object.values(charts));
  },

  async getVersionInfo({ state, getters, commit }, {
    repoType, repoName, chartName, version
  }) {
    const key = `${ repoType }/${ repoName }/${ chartName }/${ version }`;
    let info = state.versionInfos[key];

    if ( !info ) {
      const repo = getters['repo']({ repoType, repoName });

      if ( !repo ) {
        throw new Error('Repo not found');
      }

      info = await repo.followLink('info', { url: addParams(repo.links.info, { chartName, version }) });

      commit('cacheVersion', { key, info });
    }

    return info;
  },
};

const CERTIFIED_SORTS = {
  [CATALOG_ANNOTATIONS._RANCHER]:      1,
  [CATALOG_ANNOTATIONS._EXPERIMENTAL]: 1,
  [CATALOG_ANNOTATIONS._PARTNER]:      2,
  other:                               3,
};

function addChart(list, chart, repo) {
  const key = `${ repo.type }/${ repo.metadata.name }/${ chart.name }`;
  const certifiedAnnotation = chart.annotations?.[CATALOG_ANNOTATIONS.CERTIFIED];

  let certified = CATALOG_ANNOTATIONS._OTHER;
  let sideLabel = null;

  // @TODO remove fake hackery
  if ( repo.name === 'dev-charts' ) {
    certified = CATALOG_ANNOTATIONS._RANCHER;
  } else if ( chart.name.startsWith('f') ) {
    certified = CATALOG_ANNOTATIONS._PARTNER;
  } else if ( repo.isRancher ) {
    // Only charts from a rancher repo can actually set the certified flag
    certified = certifiedAnnotation || certified;
  }

  // @TODO remove fake hackery
  if ( chart.name.includes('b') ) {
    sideLabel = 'Experimental';
  } else if ( chart.annotations?.[CATALOG_ANNOTATIONS.EXPERIMENTAL] ) {
    sideLabel = 'Experimental';
  } else if ( !repo.isRancher && certifiedAnnotation && certified === CATALOG_ANNOTATIONS._OTHER) {
    // But anybody can set the side label
    sideLabel = certifiedAnnotation;
  }

  let icon = chart.icon;

  if ( icon ) {
    icon = icon.replace(/^(https?:\/\/github.com\/[^/]+\/[^/]+)\/blob/, '$1/raw');
  }

  let obj = list[key];

  if ( !obj ) {
    obj = {
      key,
      icon,
      certified,
      sideLabel,
      certifiedSort:   CERTIFIED_SORTS[certified] || 99,
      chartName:       chart.name,
      description:     chart.description,
      repoName:        repo.name,
      versions:        [],
      deprecated:      !!chart.deprecated,
      targetNamespace: chart.annotations?.[CATALOG_ANNOTATIONS.NAMESPACE],
      targetName:      chart.annotations?.[CATALOG_ANNOTATIONS.RELEASE_NAME],
    };

    if ( repo.type === CATALOG.CLUSTER_REPO ) {
      obj.repoType = 'cluster';
    } else {
      obj.repoType = 'namespace';
    }

    obj.repoName = repo.metadata.name;

    list[key] = obj;
  }

  obj.versions.push(chart);
}
