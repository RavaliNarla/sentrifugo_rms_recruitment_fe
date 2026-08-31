export const buildStateLanguageData = (
  states = [],
  mappings = [],
  languages = []
) => {
  const languageMap = {};
  languages.forEach((l) => {
    languageMap[l.languageId] = l.languageName;
  });
  const stateLangMap = {};
  mappings.forEach((m) => {
    if (!stateLangMap[m.stateId]) {
      stateLangMap[m.stateId] = [];
    }
    stateLangMap[m.stateId].push(m.languageId);
  });
  return states.map((state) => {
    const languageIds = stateLangMap[state.stateId] || [];
    const languageNames = languageIds
      .map((id) => languageMap[id])
      .filter(Boolean);

    return {
      stateId: state.stateId,
      stateName: state.stateName,
      languageIds,
      languageNames,
    };
  });
};
