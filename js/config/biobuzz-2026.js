// BIOBUZZ (FTC 2026-2027) scouting form.
// Point values from Competition Manual TU08, Table 10-2.
// Change this file each season; the app builds the form, QR records and
// team summaries from it. Keep field ids short: they go into every QR code.
//
// Field types:
//   counter  +/- count
//   toggle   yes/no
//   choice   one of `options`     (stored as 1..n, 0 = not set; no default)
//   rating   1..max               (0 = not rated)
//   text     free notes
//   zones    taps on a map of the field's tiles (see js/zones.js); `max: 1` = one tile only,
//            `edge: true` = only tiles along the field wall
// A section with `tint` (auto | teleop | end | perf) is drawn as a coloured region, its title in the
// region's border colour. Without it, the section is a plain card with its title.
// `pair: true` puts a toggle on the same row as the toggle before it (the row's toggles share it equally).

export default {
  id: 'biobuzz-2026',
  game: 'BIOBUZZ',
  season: 2026, // FTC API / FTCScout season = kickoff year
  manual: 'Competition Manual TU08, Table 10-2',

  sections: [
    {
      id: 'auto', title: 'AUTO', tint: 'auto',
      fields: [
        { id: 'al', type: 'toggle', label: 'LEAVE' },
        { id: 'as', type: 'zones', label: 'Start position', hint: 'Tap the wall tile the robot starts on', max: 1, edge: true },
        { id: 'ao', type: 'counter', label: 'Pollen in Hive' },   // into the CELL; misses aren't recorded
        { id: 'an', type: 'counter', label: 'Nectar in Hive' },
        { id: 'az', type: 'zones', label: 'Shooting position', hint: 'Tap where the robot is each time a shot scores', max: 30 },
        { id: 'ap', type: 'toggle', label: 'AUTO PARK' },
      ],
    },
    {
      id: 'teleop', title: 'TELEOP', tint: 'teleop',
      fields: [
        { id: 'to', type: 'counter', label: 'Pollen in Hive' },   // into the CELL; misses aren't recorded
        { id: 'tn', type: 'counter', label: 'Nectar in Hive' },
        { id: 'tz', type: 'zones', label: 'Shooting position', hint: 'Tap where the robot is each time a shot scores', max: 60 },
      ],
    },
    {
      id: 'end', title: 'ENDGAME', tint: 'end',
      fields: [
        { id: 'eo', type: 'counter', label: 'Pollen in Flower' },
        { id: 'ec', type: 'counter', label: 'Nectar in Flower' },
        { id: 'ep', type: 'toggle', label: 'ENDGAME PARK' },
      ],
    },
    {
      id: 'other', title: 'PERFORMANCE', tint: 'perf',
      fields: [
        { id: 'pc', type: 'choice', label: 'Pollen Collecting', options: ['Slow', 'Avg.', 'Fast'] },
        { id: 'nc', type: 'choice', label: 'Nectar Collecting', options: ['Slow', 'Avg.', 'Fast'] },
        { id: 'df', type: 'choice', label: 'Defense played', options: ['Light', 'Heavy'] }, // 1 = Light (was Some), 2 = Heavy (old records' 0 = None reads as not set)
        { id: 'dr', type: 'choice', label: 'Driver skill', options: ['Poor', 'OK', 'Great'] },
        { id: 'st', type: 'choice', label: 'Robot', options: ['MIA', 'Broke', 'Tip'] },
        { id: 'fn', type: 'counter', label: 'MINOR FOULS' },
        { id: 'fj', type: 'counter', label: 'MAJOR FOULS' },
        { id: 'nt', type: 'text', label: 'Notes', max: 200 },
      ],
    },
  ],

  // Team summary columns: the scouted counts themselves, no points. `fn(d)` gets one
  // record's field values and returns a number, true/false, or null (= skip this match).
  // agg: avg (per match) | pct (share of matches where true) | sum (matches where true) | max.
  // `group` is a section tint (auto | teleop | end | perf): columns are grouped and
  // coloured like the form's regions. A `key` line explains a column in the footnote.
  // `label` heads the table columns; the team sheet's tiles use `full` when given.
  // `one(d)`, if given, is what the team sheet's match-by-match table shows instead of fn(d).
  metrics: [
    { id: 'alv', group: 'auto', label: 'Leave', agg: 'pct', fn: d => !!d.al },
    { id: 'apo', group: 'auto', label: 'Pol', full: 'Pollen', agg: 'avg', fn: d => d.ao || 0 },
    { id: 'ane', group: 'auto', label: 'Nec', full: 'Nectar', agg: 'avg', fn: d => d.an || 0 },
    { id: 'apk', group: 'auto', label: 'Park', agg: 'pct', fn: d => !!d.ap },
    { id: 'tpo', group: 'teleop', label: 'Pol', full: 'Pollen', agg: 'avg', fn: d => d.to || 0 },
    { id: 'tne', group: 'teleop', label: 'Nec', full: 'Nectar', agg: 'avg', fn: d => d.tn || 0 },
    { id: 'epo', group: 'end', label: 'Pol', full: 'Pollen', agg: 'avg', fn: d => d.eo || 0 },
    { id: 'ene', group: 'end', label: 'Nec', full: 'Nectar', agg: 'avg', fn: d => d.ec || 0 },
    { id: 'epk', group: 'end', label: 'Park', agg: 'pct', fn: d => !!d.ep },
    { id: 'pcs', group: 'perf', label: 'Pol spd', full: 'Pollen spd', agg: 'avg', fn: d => d.pc || null, key: 'spd: 1 Slow, 2 Avg., 3 Fast' },
    { id: 'ncs', group: 'perf', label: 'Nec spd', full: 'Nectar spd', agg: 'avg', fn: d => d.nc || null },
    { id: 'def', group: 'perf', label: 'Def', full: 'Defense', agg: 'pct', fn: d => [0, 0.5, 1][d.df || 0], one: d => ['', 'L', 'H'][d.df || 0],
      key: 'Def: Heavy counts a full match, Light half' },
    { id: 'drv', group: 'perf', label: 'Driver', agg: 'avg', fn: d => d.dr || null, key: 'Driver: 1 Poor, 2 OK, 3 Great' },
    { id: 'mia', group: 'perf', label: 'MIA', agg: 'sum', fn: d => d.st === 1, key: 'MIA, Broke, Tip: number of matches' },
    { id: 'brk', group: 'perf', label: 'Broke', agg: 'sum', fn: d => d.st === 2 },
    { id: 'tip', group: 'perf', label: 'Tip', agg: 'sum', fn: d => d.st === 3 },
    { id: 'fmi', group: 'perf', label: 'Min', full: 'Minor', agg: 'avg', fn: d => d.fn || 0, key: 'Min, Maj: Minor and Major fouls per match' },
    { id: 'fma', group: 'perf', label: 'Maj', full: 'Major', agg: 'avg', fn: d => d.fj || 0 },
  ],
  // Heat maps on the team sheet: each adds up the taps of its `zones` fields over all the
  // team's matches. `group` colours it like the form's regions; `unit` names one tap.
  heatmaps: [
    { label: 'Favored shooting positions', group: 'perf', fields: ['az', 'tz'], unit: 'scored shot', lead: true },
    { label: 'Start position', group: 'auto', fields: ['as'], unit: 'start' },
    { label: 'AUTO shooting', group: 'auto', fields: ['az'], unit: 'scored shot' },
    { label: 'TELEOP shooting', group: 'teleop', fields: ['tz'], unit: 'scored shot' },
  ],
  groups: { auto: 'AUTO', teleop: 'TELEOP', end: 'ENDGAME', perf: 'PERFORMANCE' },
  defaultSort: 'tpo',
};
