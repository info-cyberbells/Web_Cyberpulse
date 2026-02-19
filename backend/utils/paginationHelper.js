export const buildCursorQuery = (before, after, sortField = '_id') => {
  const query = {};
  if (before) query[sortField] = { $lt: before };
  if (after) query[sortField] = { $gt: after };
  return query;
};

export const buildPaginationResponse = (items, limit, direction = 'backward') => {
  const hasMore = items.length > limit;
  const result = hasMore ? items.slice(0, limit) : items;

  return {
    data: direction === 'backward' ? result.reverse() : result,
    hasMore,
    nextCursor: hasMore ? result[0]._id : null,
  };
};
