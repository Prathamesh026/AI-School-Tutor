type CounterMap = Record<string, number>;

class Metrics {
  private counters: CounterMap = {};

  increment(name: string, amount = 1): void {
    this.counters[name] = (this.counters[name] ?? 0) + amount;
  }

  timing(name: string, ms: number): void {
    this.increment(`${name}_count`, 1);
    this.increment(`${name}_total_ms`, ms);
  }

  snapshot(): CounterMap {
    return { ...this.counters };
  }
}

export const metrics = new Metrics();
