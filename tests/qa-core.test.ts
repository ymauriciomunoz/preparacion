import assert from "node:assert/strict";
import test from "node:test";
import { createBalancedOptionOrders, displayedOptionIndex, isValidOptionOrder } from "../lib/option-orders.ts";
import { getCourseRecommendation } from "../lib/recommendation.ts";

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

test("1.000 generaciones mantienen 20 claves por posición en un examen de 80 preguntas", () => {
  const items = Array.from({ length: 80 }, (_, index) => ({
    id: `q-${index}`,
    optionCount: 4,
    correctOption: index % 4,
  }));

  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const orders = createBalancedOptionOrders(items, seededRandom(attempt + 1));
    const distribution = [0, 0, 0, 0];
    items.forEach((item) => {
      const order = orders[item.id];
      assert.equal(isValidOptionOrder(order, 4), true);
      distribution[displayedOptionIndex(order, item.correctOption)] += 1;
    });
    assert.deepEqual(distribution, [20, 20, 20, 20]);
  }
});

test("la recomendación no inventa un área débil sin evidencia suficiente", () => {
  assert.deepEqual(
    getCourseRecommendation(
      { correct: 0, answered: 0, total: 40 },
      { correct: 0, answered: 0, total: 40 },
    ).kind,
    "insufficient",
  );
});

test("la recomendación informa empate cuando las tasas son equivalentes", () => {
  const result = getCourseRecommendation(
    { correct: 8, answered: 16, total: 40 },
    { correct: 10, answered: 20, total: 40 },
  );
  assert.equal(result.kind, "tie");
  assert.equal(result.track, null);
});

test("la recomendación selecciona únicamente la competencia con menor tasa válida", () => {
  assert.equal(getCourseRecommendation(
    { correct: 8, answered: 20, total: 40 },
    { correct: 15, answered: 20, total: 40 },
  ).track, "math");
  assert.equal(getCourseRecommendation(
    { correct: 18, answered: 20, total: 40 },
    { correct: 10, answered: 20, total: 40 },
  ).track, "reading");
});
