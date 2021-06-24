export function options(issues, hideRancher) {
  if (!issues) {
    issues = 'https://github.com/rancher/dashboard/issues/new';
  }

  if (hideRancher) {
    return { 'footer.issue': issues };
  }

  return {
    'footer.docs':   'https://github.com/harvester/harvester/tree/master/docs',
    'footer.forums': 'https://forums.rancher.com/',
    'footer.slack':  'https://slack.rancher.io',
    'footer.issue':  'https://github.com/harvester/harvester/issues/new/choose',
  };
}
