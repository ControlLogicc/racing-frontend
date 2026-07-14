const normalizePrize = (prize) => ({
  id: prize.id ?? prize.prizeId,
  raceId: Number(prize.raceId),
  position: Number(prize.position),
  amount: Number(prize.amount ?? prize.prizeAmount ?? 0),
  score: Number(prize.score ?? prize.scoreAwarded ?? 0),
});

export function getPrizeOrderError({ prizes, raceId, position, amount, score, ignoredPrizeId = null }) {
  if (raceId === '' || position === '' || amount === '') return '';

  const candidate = {
    id: ignoredPrizeId,
    raceId: Number(raceId),
    position: Number(position),
    amount: Number(amount),
    score: Number(score || 0),
  };

  if (![candidate.raceId, candidate.position, candidate.amount, candidate.score].every(Number.isFinite)) {
    return '';
  }

  const tiers = (prizes || [])
    .map(normalizePrize)
    .filter((prize) => (
      prize.raceId === candidate.raceId
      && (ignoredPrizeId == null || String(prize.id) !== String(ignoredPrizeId))
    ));

  tiers.push(candidate);
  tiers.sort((a, b) => a.position - b.position);

  for (let index = 1; index < tiers.length; index += 1) {
    const previous = tiers[index - 1];
    const current = tiers[index];

    if (current.amount > previous.amount) {
      return `Tiền thưởng hạng ${current.position} không được cao hơn hạng ${previous.position}.`;
    }

    if (current.score > previous.score) {
      return `Điểm thưởng hạng ${current.position} không được cao hơn hạng ${previous.position}.`;
    }
  }

  if (candidate.position >= 7 && candidate.score >= 0) {
    return `Từ hạng 7 trở xuống, điểm thưởng phải là số âm.`;
  }

  return '';
}
