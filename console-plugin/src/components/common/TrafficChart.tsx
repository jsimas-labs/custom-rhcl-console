import * as React from 'react';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartVoronoiContainer,
  ChartThemeColor,
} from '@patternfly/react-charts/victory';
import { Card, CardTitle, CardBody, Spinner } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { usePrometheusRange, TimeSeries } from '../../hooks/usePrometheusRange';
import {
  statusCodeRateRangeQuery,
  latencyPercentileRangeQuery,
  trafficOverTimeQuery,
} from '../../utils/prometheusQueries';

interface TrafficChartProps {
  kind: 'Gateway' | 'HTTPRoute';
  name: string;
  namespace: string;
}

const REQUEST_COLORS = ['#3E8635', '#F0AB00', '#C9190B'];
const LATENCY_COLORS = ['#06C', '#8481DD', '#EC7A08'];

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const RequestRateChart: React.FC<{ series: TimeSeries[] }> = ({ series }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const legendData = [
    { name: '2xx', symbol: { fill: REQUEST_COLORS[0] } },
    { name: '4xx', symbol: { fill: REQUEST_COLORS[1] } },
    { name: '5xx', symbol: { fill: REQUEST_COLORS[2] } },
  ];

  const hasData = series.some((s) => s.data.length > 0);

  return (
    <Card isCompact>
      <CardTitle>{t('Request rate')} ({t('last hour')})</CardTitle>
      <CardBody>
        {!hasData ? (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pf-t--global--color--nonstatus--gray--default)' }}>
            {t('No data available')}
          </div>
        ) : (
          <Chart
            height={200}
            padding={{ top: 10, bottom: 40, left: 60, right: 20 }}
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }: { datum: { x: Date; y: number; childName: string } }) =>
                  `${datum.childName}: ${datum.y?.toFixed(2)} req/s`
                }
              />
            }
            legendData={legendData}
            legendPosition="bottom"
            themeColor={ChartThemeColor.multiUnordered}
          >
            <ChartAxis
              tickFormat={(t: Date) => formatTime(t)}
              fixLabelOverlap
            />
            <ChartAxis dependentAxis tickFormat={(t: number) => `${t.toFixed(1)}`} />
            <ChartGroup>
              {series.map((s, i) => (
                <ChartArea
                  key={s.label}
                  name={s.label}
                  data={s.data.map((d) => ({ x: d.x, y: d.y }))}
                  style={{ data: { fill: REQUEST_COLORS[i], fillOpacity: 0.3, stroke: REQUEST_COLORS[i] } }}
                />
              ))}
            </ChartGroup>
          </Chart>
        )}
      </CardBody>
    </Card>
  );
};

const LatencyChart: React.FC<{ series: TimeSeries[] }> = ({ series }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');
  const legendData = [
    { name: 'p50', symbol: { fill: LATENCY_COLORS[0] } },
    { name: 'p95', symbol: { fill: LATENCY_COLORS[1] } },
    { name: 'p99', symbol: { fill: LATENCY_COLORS[2] } },
  ];

  const hasData = series.some((s) => s.data.length > 0);

  return (
    <Card isCompact>
      <CardTitle>{t('Latency')} ({t('last hour')})</CardTitle>
      <CardBody>
        {!hasData ? (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pf-t--global--color--nonstatus--gray--default)' }}>
            {t('No data available')}
          </div>
        ) : (
          <Chart
            height={200}
            padding={{ top: 10, bottom: 40, left: 60, right: 20 }}
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }: { datum: { x: Date; y: number; childName: string } }) =>
                  `${datum.childName}: ${datum.y?.toFixed(1)}ms`
                }
              />
            }
            legendData={legendData}
            legendPosition="bottom"
            themeColor={ChartThemeColor.multiUnordered}
          >
            <ChartAxis
              tickFormat={(t: Date) => formatTime(t)}
              fixLabelOverlap
            />
            <ChartAxis dependentAxis tickFormat={(t: number) => `${t.toFixed(0)}ms`} />
            <ChartGroup>
              {series.map((s, i) => (
                <ChartLine
                  key={s.label}
                  name={s.label}
                  data={s.data.map((d) => ({ x: d.x, y: d.y }))}
                  style={{ data: { stroke: LATENCY_COLORS[i], strokeWidth: 2 } }}
                />
              ))}
            </ChartGroup>
          </Chart>
        )}
      </CardBody>
    </Card>
  );
};

export const TrafficCharts: React.FC<TrafficChartProps> = ({ kind, name, namespace }) => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  const rateQueries = React.useMemo(
    () => [
      { label: '2xx', query: statusCodeRateRangeQuery(namespace, name, kind, '2xx') },
      { label: '4xx', query: statusCodeRateRangeQuery(namespace, name, kind, '4xx') },
      { label: '5xx', query: statusCodeRateRangeQuery(namespace, name, kind, '5xx') },
    ],
    [namespace, name, kind],
  );

  const latencyQueries = React.useMemo(
    () => [
      { label: 'p50', query: latencyPercentileRangeQuery(namespace, name, kind, 0.5) },
      { label: 'p95', query: latencyPercentileRangeQuery(namespace, name, kind, 0.95) },
      { label: 'p99', query: latencyPercentileRangeQuery(namespace, name, kind, 0.99) },
    ],
    [namespace, name, kind],
  );

  const { series: rateSeries, loaded: rateLoaded } = usePrometheusRange(rateQueries, 3600, 60);
  const { series: latencySeries, loaded: latencyLoaded } = usePrometheusRange(latencyQueries, 3600, 60);

  if (!rateLoaded || !latencyLoaded) {
    return (
      <Card isCompact>
        <CardTitle>{t('Charts')}</CardTitle>
        <CardBody><Spinner size="lg" /></CardBody>
      </Card>
    );
  }

  return (
    <>
      <RequestRateChart series={rateSeries} />
      <LatencyChart series={latencySeries} />
    </>
  );
};

export const TrafficSparkline: React.FC<TrafficChartProps> = ({ kind, name, namespace }) => {
  const queries = React.useMemo(
    () => [{ label: 'req/s', query: trafficOverTimeQuery(namespace, name, kind) }],
    [namespace, name, kind],
  );

  const { series, loaded } = usePrometheusRange(queries, 3600, 120);

  if (!loaded || !series[0]?.data.length) {
    return null;
  }

  return (
    <div style={{ height: 40, marginTop: 8 }}>
      <Chart
        height={40}
        padding={{ top: 2, bottom: 2, left: 0, right: 0 }}
        themeColor={ChartThemeColor.blue}
      >
        <ChartArea
          data={series[0].data.map((d) => ({ x: d.x, y: d.y }))}
          style={{ data: { fillOpacity: 0.2, strokeWidth: 1.5 } }}
        />
      </Chart>
    </div>
  );
};
