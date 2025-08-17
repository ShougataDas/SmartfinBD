// src/utils/performanceTracker.ts

import { logger } from "@/utils/logger";
// import { MonitoringService } from './monitoring'; // Assuming you have a monitoring service
// If you have a specific monitoring service (e.g., Firebase Performance Monitoring, Sentry), import it here.
// For now, we'll just log to console.

export class PerformanceTracker {
  private static traces: Map<string, number> = new Map();

  static startTrace(name: string): void {
    this.traces.set(name, Date.now());
    logger.debug(`Performance trace started for: ${name}`);
  }

  static endTrace(name: string): number {
    const startTime = this.traces.get(name);
    if (!startTime) {
      logger.warn(`No trace found for ${name}. Cannot end trace.`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.traces.delete(name);

    logger.info(`Performance trace ${name} took ${duration}ms`);

    // In a real application, you would send this data to a monitoring service
    // Example with a hypothetical MonitoringService:
    /*
        MonitoringService.logEvent('performance_trace', {
          trace_name: name,
          duration_ms: duration,
        });
        */

    return duration;
  }

  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTrace(name);
    try {
      const result = await fn();
      return result;
    } catch (error) {
      logger.error(`Error during async performance trace ${name}:`, error);
      throw error; // Re-throw the error after logging
    } finally {
      this.endTrace(name);
    }
  }
}
