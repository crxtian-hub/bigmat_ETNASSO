async function requestJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();

  return { response, data };
}

function buildEntityUrl(baseUrl, id) {
  return id ? `${baseUrl}?id=${encodeURIComponent(id)}` : baseUrl;
}

function buildSectionUrl(baseUrl, section) {
  return `${baseUrl}?section=${encodeURIComponent(section)}`;
}

function createFormData(fields, fileField) {
  const body = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    body.append(key, value);
  });

  if (fileField?.file) {
    body.append(fileField.name, fileField.file);
  }

  return body;
}
