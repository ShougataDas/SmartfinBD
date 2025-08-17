// src/utils/performanceMonitor.ts

import { logger } from "@/utils/logger";
import { InteractionManager } from "react-native";

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): void {
    this.metrics.set(label, Date.now());
    logger.debug(`Performance timing started for: ${label}`);
  }

  endTiming(label: string): number {
    const startTime = this.metrics.get(label);
    if (!startTime) {
      logger.warn(`No start time found for ${label}. Cannot end timing.`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.metrics.delete(label);

    logger.info(`Performance: ${label} took ${duration}ms`);
    return duration;
  }

  async measureScreenLoad(
    screenName: string,
    loadFunction: () => Promise<void>
  ): Promise<void> {
    this.startTiming(`screen_load_${screenName}`);

    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        try {
          await loadFunction();
        } catch (error) {
          logger.error(`Error during screen load for ${screenName}:`, error);
        } finally {
          this.endTiming(`screen_load_${screenName}`);
          resolve();
        }
      });
    });
  }

  async measureAPICall<T>(
    apiName: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    this.startTiming(`api_${apiName}`);

    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      logger.error(`Error during API call ${apiName}:`, error);
      throw error; // Re-throw the error after logging
    } finally {
      this.endTiming(`api_${apiName}`);
    }
  }
}
