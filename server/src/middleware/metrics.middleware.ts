import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

// ─── Registry ──────────────────────────────────────────────────────────────
export const register = new client.Registry();

// Default Node.js process metrics (memory, CPU, event loop lag, etc.)
client.collectDefaultMetrics({ register, prefix: 'spliteasy_' });

// ─── Custom Metrics ─────────────────────────────────────────────────────────

/** Total HTTP requests counter — labelled by method, route, status */
export const httpRequestsTotal = new client.Counter({
  name: 'spliteasy_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

/** HTTP request duration histogram — P50/P90/P95/P99 latencies */
export const httpRequestDurationMs = new client.Histogram({
  name: 'spliteasy_http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [register],
});

/** Active in-flight requests gauge */
export const httpActiveRequests = new client.Gauge({
  name: 'spliteasy_http_active_requests',
  help: 'Number of active HTTP requests in-flight',
  labelNames: ['method', 'route'],
  registers: [register],
});

/** HTTP 4xx/5xx error counter */
export const httpErrorsTotal = new client.Counter({
  name: 'spliteasy_http_errors_total',
  help: 'Total number of HTTP errors (4xx and 5xx)',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// ─── Business Metrics ───────────────────────────────────────────────────────

/** Expenses created counter */
export const expensesCreated = new client.Counter({
  name: 'spliteasy_expenses_created_total',
  help: 'Total number of expenses created',
  registers: [register],
});

/** Groups created counter */
export const groupsCreated = new client.Counter({
  name: 'spliteasy_groups_created_total',
  help: 'Total number of groups created',
  registers: [register],
});

/** Settlements calculated counter */
export const settlementsCalculated = new client.Counter({
  name: 'spliteasy_settlements_calculated_total',
  help: 'Total number of settlement calculations',
  registers: [register],
});

// ─── Route Normalizer ───────────────────────────────────────────────────────
/**
 * Normalize Express route paths so dynamic IDs are replaced with param names.
 * e.g.  /api/expenses/64f3a1b2c3d4e5f6a7b8c9d0  →  /api/expenses/:expenseId
 * This prevents metric cardinality explosion from unique MongoDB IDs.
 */
function normalizeRoute(req: Request): string {
  // Use Express matched route if available (most accurate)
  if (req.route?.path) {
    const base = req.baseUrl || '';
    return base + req.route.path;
  }

  // Fallback: replace 24-char hex MongoDB ObjectIds and numeric IDs
  return req.path
    .replace(/\/[0-9a-fA-F]{24}/g, '/:id')
    .replace(/\/\d+/g, '/:id');
}

// ─── Middleware ──────────────────────────────────────────────────────────────
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip the /metrics endpoint itself to avoid self-instrumentation noise
  if (req.path === '/metrics') {
    return next();
  }

  const startTime = Date.now();
  const route = normalizeRoute(req);

  httpActiveRequests.inc({ method: req.method, route });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = String(res.statusCode);
    // Re-read route after finish — Express has fully matched by then
    const finalRoute = normalizeRoute(req);

    httpRequestsTotal.inc({ method: req.method, route: finalRoute, status_code: statusCode });
    httpRequestDurationMs.observe({ method: req.method, route: finalRoute, status_code: statusCode }, duration);
    httpActiveRequests.dec({ method: req.method, route });

    if (res.statusCode >= 400) {
      httpErrorsTotal.inc({ method: req.method, route: finalRoute, status_code: statusCode });
    }
  });

  next();
}
