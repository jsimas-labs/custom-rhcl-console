import * as React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Spinner,
  EmptyState,
  EmptyStateBody,
  Bullseye,
  Progress,
  ProgressSize,
} from '@patternfly/react-core';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import { topConsumersByRouteQuery } from '../../utils/prometheusQueries';

interface TopConsumersProps {
  routeName: string;
  namespace: string;
  topN?: number;
  /** Polling interval in ms; default 60s (Prometheus scrape is 30s). */
  pollInterval?: number;
}

interface ConsumerBucket {
  consumerId: string;
  reqRate: number;
}

/**
 * "Top consumers" ranking on the API Product detail page.
 *
 * Buckets traffic against the HTTPRoute by `request_headers_x_consumer_id`
 * (a Prometheus label populated by the req041 Telemetry CR from the
 * `x-consumer-id` request header). The AuthPolicy injects that header
 * after successful API-key auth using `auth.identity.metadata.name`,
 * which is the Kuadrant API-key Secret name (e.g. `banking-api-key-alice`,
 * `pix-api-key-gold`).
 *
 * When no real bucket comes back (the AuthPolicy has not yet been
 * patched on a particular cluster, or no API-key traffic has hit the
 * route in the window), an explanatory empty state surfaces the missing
 * ingredient instead of silently rendering blank — that's the failure
 * mode that would otherwise look like a plugin bug to the user.
 */
const TopConsumers: React.FC<TopConsumersProps> = ({
  routeName,
  namespace,
  topN = 5,
  pollInterval = 60000,
}) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const [buckets, setBuckets] = React.useState<ConsumerBucket[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchTop = React.useCallback(async () => {
    if (!routeName || !namespace) {
      setBuckets([]);
      setLoaded(true);
      return;
    }
    try {
      const query = topConsumersByRouteQuery(namespace, routeName, topN);
      const url = `/api/prometheus/api/v1/query?query=${encodeURIComponent(query)}`;
      const response = await consoleFetch(url);
      const json = await response.json();
      const next: ConsumerBucket[] = (json?.data?.result || [])
        .map((r: { metric: Record<string, string>; value: [number, string] }) => ({
          consumerId: r.metric.request_headers_x_consumer_id || 'unknown',
          reqRate: parseFloat(r.value[1]) || 0,
        }))
        .sort((a: ConsumerBucket, b: ConsumerBucket) => b.reqRate - a.reqRate);
      setBuckets(next);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoaded(true);
    }
  }, [routeName, namespace, topN]);

  React.useEffect(() => {
    fetchTop();
    const handle = setInterval(fetchTop, pollInterval);
    return () => clearInterval(handle);
  }, [fetchTop, pollInterval]);

  const max = buckets[0]?.reqRate || 0;
  // Progress bar percentages are computed relative to the top bucket
  // (rank-style "X% of leader") — that keeps small absolute numbers
  // visually meaningful and matches Splunk/Grafana "Top N" idioms.

  return (
    <Card>
      <CardTitle>{t('Top consumers')} ({t('last hour')})</CardTitle>
      <CardBody>
        {!loaded ? (
          <Bullseye><Spinner size="md" /></Bullseye>
        ) : error ? (
          <EmptyState variant="sm" titleText={t('Error loading consumers')} headingLevel="h4">
            <EmptyStateBody>{error.message}</EmptyStateBody>
          </EmptyState>
        ) : buckets.length === 0 ? (
          <EmptyState variant="sm" titleText={t('No consumer data yet')} headingLevel="h4">
            <EmptyStateBody>
              {t(
                'No API-key traffic recorded in the last hour. The ranking populates once the AuthPolicy injects "x-consumer-id" on successful auth and requests flow through.',
              )}
            </EmptyStateBody>
          </EmptyState>
        ) : (
          <div>
            {buckets.map((b) => (
              <div key={b.consumerId} style={{ marginBottom: 12 }}>
                <Progress
                  value={max > 0 ? (b.reqRate / max) * 100 : 0}
                  title={b.consumerId}
                  label={`${b.reqRate.toFixed(3)} req/s`}
                  valueText={`${b.reqRate.toFixed(3)} req/s`}
                  size={ProgressSize.sm}
                />
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default TopConsumers;
