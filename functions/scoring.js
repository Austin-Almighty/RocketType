/* eslint-disable @typescript-eslint/no-require-imports */
const { createTypingState, typingReducer, correctCharacters, characterStats } = require('./lib/engine');
const { computeWpm, computeRaw, SCORING_VERSION } = require('./lib/stats');
const { HttpsError } = require('firebase-functions/v2/https');
const MAX_EVENTS = 20000;

function verifyReplay(session, events, now) {
  const invalid = (message) => { throw new HttpsError('invalid-argument', message); };
  if (!Array.isArray(events) || !events.length || events.length > MAX_EVENTS) invalid('Invalid typing event count.');
  if (!session.startedAt) throw new HttpsError('failed-precondition', 'The test has not started.');
  const startedAt = session.startedAt.toMillis();
  const isTimed = session.testKind === 'standard' && session.gameMode === 'Rocket Run';
  const duration = isTimed ? session.time : Math.max(0.001, (now - startedAt) / 1000);
  if (now < startedAt || (isTimed && now < startedAt + duration * 1000 - 1000)) {
    invalid('The test finished before the server deadline.');
  }
  let state = createTypingState(session.targets);
  let lastTime = -1;
  for (const event of events) {
    if (!event || !Number.isFinite(event.ms) || event.ms < 0 || event.ms < lastTime || (isTimed ? event.ms >= duration * 1000 : event.ms > duration * 1000 + 1000)) invalid('Invalid event timing.');
    if (lastTime < 0 && event.ms !== 0) invalid('The first event must start the test.');
    if (state.finished) invalid('Input continued after the test finished.');
    if (!['char', 'space', 'backspace', 'deleteWord'].includes(event.type)) invalid('Invalid typing action.');
    if (event.type === 'char' && (typeof event.char !== 'string' || [...event.char].length !== 1 || /\s/u.test(event.char))) invalid('Invalid character.');
    if (Object.keys(event).some((key) => !['type', 'ms', ...(event.type === 'char' ? ['char'] : [])].includes(key))) invalid('Unexpected typing event field.');
    const { ms, ...action } = event;
    lastTime = ms;
    state = typingReducer(state, action);
  }
  if (!state.started || !isTimed && !state.finished) invalid('The word list is not complete.');
  if (state.keyCount > duration * 100 + 10) invalid('The typing rate exceeds the supported limit.');
  const wpm = computeWpm(correctCharacters(state), duration);
  const raw = computeRaw(state.keyCount, duration);
  if (wpm > 500 || raw > 1500) invalid('The score exceeds the supported speed limit.');
  // Client metrics are never used to calculate the saved score.
  return {
    gameMode: session.gameMode, time: session.time, count: session.count, words: session.words,
    testKind: session.testKind, scoringVersion: SCORING_VERSION, verified: true,
    elapsedSeconds: duration, characters: characterStats(state), keyCount: state.keyCount,
    errors: state.mistakes, wpm, raw,
    accuracy: state.keyCount ? Math.round((state.keyCount - state.mistakes) / state.keyCount * 1000) / 10 : 0,
  };
}
module.exports = { verifyReplay, MAX_EVENTS };
