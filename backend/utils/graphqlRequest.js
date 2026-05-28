const { parse } = require('graphql');

const PUBLIC_GRAPHQL_FIELDS = new Set(['login', 'register', '__schema', '__type', '__typename']);

function collectSelectionFields(selectionSet, fragments, fields, visitedFragments = new Set()) {
  for (const selection of selectionSet?.selections || []) {
    if (selection.kind === 'Field') {
      fields.add(selection.name.value);
    }

    if (selection.kind === 'InlineFragment') {
      collectSelectionFields(selection.selectionSet, fragments, fields, visitedFragments);
    }

    if (selection.kind === 'FragmentSpread' && !visitedFragments.has(selection.name.value)) {
      visitedFragments.add(selection.name.value);
      collectSelectionFields(fragments.get(selection.name.value)?.selectionSet, fragments, fields, visitedFragments);
    }
  }
}

function getRootOperationFields(query, operationName) {
  if (typeof query !== 'string') return new Set();

  const document = parse(query);
  const fragments = new Map();
  const operations = [];

  for (const definition of document.definitions) {
    if (definition.kind === 'FragmentDefinition') {
      fragments.set(definition.name.value, definition);
    }

    if (definition.kind === 'OperationDefinition') {
      operations.push(definition);
    }
  }

  const selectedOperations = operationName
    ? operations.filter(operation => operation.name?.value === operationName)
    : operations;

  const fields = new Set();
  for (const operation of selectedOperations) {
    collectSelectionFields(operation.selectionSet, fragments, fields);
  }

  return fields;
}

function documentContainsField(query, fieldName, operationName) {
  try {
    return getRootOperationFields(query, operationName).has(fieldName);
  } catch {
    return typeof query === 'string' && query.includes(fieldName);
  }
}

function requestContainsAIInquiry(body) {
  const operations = Array.isArray(body) ? body : [body];
  return operations.some(operation => documentContainsField(operation?.query, 'startAIInquiry', operation?.operationName));
}

function isPublicGraphQLRequest(body) {
  const operations = Array.isArray(body) ? body : [body];
  return operations.every(operation => {
    try {
      const fields = getRootOperationFields(operation?.query, operation?.operationName);
      return fields.size > 0 && [...fields].every(field => PUBLIC_GRAPHQL_FIELDS.has(field));
    } catch {
      return false;
    }
  });
}

module.exports = {
  documentContainsField,
  getRootOperationFields,
  isPublicGraphQLRequest,
  requestContainsAIInquiry,
};
