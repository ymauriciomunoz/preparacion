export interface OptionOrderItem {
  id: string;
  optionCount: number;
  correctOption: number;
}

export type OptionOrders = Record<string, number[]>;

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

/**
 * Crea un orden estable para las opciones y reparte las respuestas correctas
 * de la forma más uniforme posible entre las posiciones disponibles.
 */
export function createBalancedOptionOrders(
  items: readonly OptionOrderItem[],
  random: () => number = Math.random,
): OptionOrders {
  const grouped = new Map<number, OptionOrderItem[]>();
  items.forEach((item) => {
    const group = grouped.get(item.optionCount) ?? [];
    group.push(item);
    grouped.set(item.optionCount, group);
  });

  const orders: OptionOrders = {};
  grouped.forEach((group, optionCount) => {
    const targetPositions = shuffled(
      group.map((_, index) => index % optionCount),
      random,
    );

    group.forEach((item, itemIndex) => {
      const distractors = shuffled(
        Array.from({ length: optionCount }, (_, index) => index).filter((index) => index !== item.correctOption),
        random,
      );
      distractors.splice(targetPositions[itemIndex], 0, item.correctOption);
      orders[item.id] = distractors;
    });
  });

  return orders;
}

export function isValidOptionOrder(order: unknown, optionCount: number): order is number[] {
  return Array.isArray(order)
    && order.length === optionCount
    && new Set(order).size === optionCount
    && order.every((value) => Number.isInteger(value) && value >= 0 && value < optionCount);
}

export function displayedOptionIndex(order: readonly number[], originalOptionIndex: number): number {
  return order.indexOf(originalOptionIndex);
}
