export type HealthStatus = 'healthy' | 'degraded' | 'offline';

export interface ServiceHealthReport {
  serviceName: string;
  status: HealthStatus;
  latencyMs: number;
  lastChecked: number;
  endpointUrl?: string;
  details?: string;
}

export interface NvkSystemHealthReport {
  overallStatus: HealthStatus;
  services: ServiceHealthReport[];
  checkedAt: number;
}

export class ConnectionHealthMonitor {
  private static instance: ConnectionHealthMonitor;
  private lastReport: NvkSystemHealthReport | null = null;
  private checkInterval: any = null;

  private constructor() {}

  public static getInstance(): ConnectionHealthMonitor {
    if (!ConnectionHealthMonitor.instance) {
      ConnectionHealthMonitor.instance = new ConnectionHealthMonitor();
    }
    return ConnectionHealthMonitor.instance;
  }

  public async checkService(
    serviceName: string,
    url: string,
    timeoutMs = 3500
  ): Promise<ServiceHealthReport> {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timer);

      const latency = Math.round(performance.now() - start);
      const status: HealthStatus = res.ok ? 'healthy' : 'degraded';

      return {
        serviceName,
        status,
        latencyMs: latency,
        lastChecked: Date.now(),
        endpointUrl: url,
        details: `HTTP status ${res.status}`,
      };
    } catch (err) {
      const latency = Math.round(performance.now() - start);
      return {
        serviceName,
        status: 'offline',
        latencyMs: latency,
        lastChecked: Date.now(),
        endpointUrl: url,
        details: err instanceof Error ? err.message : 'Network unreachable',
      };
    }
  }

  public async evaluateSystemHealth(ollamaBaseUrl = 'http://localhost:11434'): Promise<NvkSystemHealthReport> {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!isOnline) {
      const offlineReport: NvkSystemHealthReport = {
        overallStatus: 'offline',
        services: [
          {
            serviceName: 'Browser Network',
            status: 'offline',
            latencyMs: 0,
            lastChecked: Date.now(),
            details: 'Navigator offline',
          },
        ],
        checkedAt: Date.now(),
      };
      this.lastReport = offlineReport;
      return offlineReport;
    }

    const [pollinationsReport, ollamaReport] = await Promise.all([
      this.checkService('Pollinations AI', 'https://text.pollinations.ai/'),
      this.checkService('Ollama Local', `${ollamaBaseUrl}/api/tags`, 2000),
    ]);

    const services = [pollinationsReport, ollamaReport];
    const onlineCount = services.filter((s) => s.status === 'healthy').length;

    let overallStatus: HealthStatus = 'offline';
    if (onlineCount === services.length) {
      overallStatus = 'healthy';
    } else if (onlineCount > 0) {
      overallStatus = 'degraded';
    }

    const report: NvkSystemHealthReport = {
      overallStatus,
      services,
      checkedAt: Date.now(),
    };

    this.lastReport = report;
    return report;
  }

  public getLastReport(): NvkSystemHealthReport | null {
    return this.lastReport;
  }
}

export const connectionHealth = ConnectionHealthMonitor.getInstance();
