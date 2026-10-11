export function probeOptions(search) {
  const params = new URLSearchParams(search);
  const mode = params.get('mode') ?? 'jevil-room';
  const engine = params.get('engine') ?? 'browser';
  if (!['jevil', 'jevil-room', 'api-test', 'census', 'baseline'].includes(mode)) throw Error('Unsupported probe mode');
  if (!['browser', 'portable', 'diagnostic', 'original'].includes(engine)) throw Error('Unsupported runtime');
  const chapter = mode === 'census' ? Number(params.get('chapter') ?? '1') : 1;
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 5) throw Error('Unsupported chapter');
  const args = ['/game/chapter' + chapter + '_windows/data.win', '--save-folder', '/saves', '--disable-log-colours', '--seed', '20261011'];
  if (mode === 'census') args.push('--print-unknown-functions');
  const frames = params.get('frames') ?? (mode === 'api-test' ? '120' : null);
  if (frames !== null) {
    if (!/^\d+$/.test(frames) || !Number.isSafeInteger(Number(frames)) || Number(frames) < 1) throw Error('Invalid frame limit');
    args.push('--exit-at-frame', String(Number(frames)));
  }
  return {mode, engine, chapter, args, autoEngine: !params.has('engine')};
}

export function probeEngine(options, supportsJspi) {
  return options.autoEngine && !supportsJspi ? 'portable' : options.engine;
}
