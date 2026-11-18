const { json, parse, rpc } = require('./_lib');
const PRIZES = ['Rs. 500', 'Rs. 1,000', 'Rs. 2,000', 'Rs. 3,000', 'Rs. 4,000', 'Rs. 5,000', 'Watch', 'Perfume', 'Empty'];
exports.handler = async (event) => {
  const p = parse(event); if (p.err) return p.err;
  try {
    const r = await rpc('do_spin', { p_hash: p.hash });
    if (r.submitted) return json(409, { error: 'already_completed' });
    if (!r.spun) return json(409, { error: 'no_spins_left', results: r.results });
    const prize = r.results[r.results.length - 1];
    return json(200, { prize, index: PRIZES.indexOf(prize), results: r.results, remaining: 3 - r.results.length });
  } catch (e) { console.error(e); return json(500, { error: 'Server error. Please try again.' }); }
};
