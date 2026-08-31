// API → UI
export const mapGenericDocFromApi = (api) => ({
  id: api.id,
  type: api.type,
  fileName: api.fileName,
  fileUrl: api.fileUrl,
  version: api.versionNo,
});

export const mapGenericDocsFromApi = (list = []) => {
  if (!Array.isArray(list)) return [];
  return list.map(mapGenericDocFromApi);
};
