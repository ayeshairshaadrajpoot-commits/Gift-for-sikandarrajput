const { json, parse, rpc } = require('./_lib');
exports.handler = async (event) => {
  const p = parse(event); if (p.err) return p.err;
  try { return json(200, await rpc('get_state', { p_hash: p.hash })); }
  catch (e) { console.error(e); return json(500, { error: 'Server error. Please try again.' }); }
};
