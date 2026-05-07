import * as React from 'react';
import {
  PageSection,
  Title,
  Spinner,
  Bullseye,
  EmptyState,
  EmptyStateBody,
} from '@patternfly/react-core';
import {
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
  ModelKind,
  GraphComponent,
  DefaultNode,
  DefaultEdge,
  DefaultGroup,
  NodeShape,
  Graph,
  Layout,
  LayoutFactory,
  ComponentFactory,
  DagreLayout,
  GRAPH_LAYOUT_END_EVENT,
  NodeModel,
  EdgeModel,
  Model,
} from '@patternfly/react-topology';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';
import { GatewayGVK, HTTPRouteGVK } from '../../models';
import { Gateway, HTTPRoute } from '../../types';

const GATEWAY_TYPE = 'gateway-node';
const ROUTE_TYPE = 'route-node';
const SERVICE_TYPE = 'service-node';

const layoutFactory: LayoutFactory = (type: string, graph: Graph): Layout =>
  new DagreLayout(graph, {
    rankdir: 'LR',
    nodesep: 60,
    ranksep: 100,
  });

const componentFactory: ComponentFactory = (kind: ModelKind) => {
  if (kind === ModelKind.graph) return GraphComponent;
  if (kind === ModelKind.node) return DefaultNode;
  if (kind === ModelKind.edge) return DefaultEdge;
  return DefaultGroup;
};

const TopologyPage: React.FC = () => {
  const { t } = useTranslation('plugin__custom-rhcl-console');

  const [gateways, gwLoaded] = useK8sWatchResource<Gateway[]>({
    groupVersionKind: GatewayGVK,
    isList: true,
  });

  const [httpRoutes, routeLoaded] = useK8sWatchResource<HTTPRoute[]>({
    groupVersionKind: HTTPRouteGVK,
    isList: true,
  });

  const loaded = gwLoaded && routeLoaded;

  const model = React.useMemo((): Model | null => {
    if (!loaded) return null;

    const nodes: NodeModel[] = [];
    const edges: EdgeModel[] = [];

    for (const gw of gateways || []) {
      const gwId = `gw-${gw.metadata?.namespace}-${gw.metadata?.name}`;
      nodes.push({
        id: gwId,
        type: GATEWAY_TYPE,
        label: `Gateway: ${gw.metadata?.name}`,
        width: 120,
        height: 60,
        shape: NodeShape.rect,
        data: { kind: 'Gateway', resource: gw },
      });
    }

    const serviceSet = new Set<string>();

    for (const route of httpRoutes || []) {
      const routeId = `route-${route.metadata?.namespace}-${route.metadata?.name}`;
      nodes.push({
        id: routeId,
        type: ROUTE_TYPE,
        label: `HTTPRoute: ${route.metadata?.name}`,
        width: 140,
        height: 60,
        shape: NodeShape.rect,
        data: { kind: 'HTTPRoute', resource: route },
      });

      for (const parentRef of route.spec.parentRefs || []) {
        const parentNs = parentRef.namespace || route.metadata?.namespace || '';
        const gwId = `gw-${parentNs}-${parentRef.name}`;
        edges.push({
          id: `edge-${gwId}-${routeId}`,
          type: 'edge',
          source: gwId,
          target: routeId,
        });
      }

      for (const rule of route.spec.rules || []) {
        for (const backend of rule.backendRefs || []) {
          const backendNs = backend.namespace || route.metadata?.namespace || '';
          const svcId = `svc-${backendNs}-${backend.name}`;
          if (!serviceSet.has(svcId)) {
            serviceSet.add(svcId);
            nodes.push({
              id: svcId,
              type: SERVICE_TYPE,
              label: `Service: ${backend.name}`,
              width: 120,
              height: 60,
              shape: NodeShape.ellipse,
              data: { kind: 'Service', name: backend.name, namespace: backendNs },
            });
          }
          edges.push({
            id: `edge-${routeId}-${svcId}`,
            type: 'edge',
            source: routeId,
            target: svcId,
          });
        }
      }
    }

    return {
      nodes,
      edges,
      graph: {
        id: 'rhcl-topology',
        type: 'graph',
        layout: 'Dagre',
      },
    };
  }, [loaded, gateways, httpRoutes]);

  if (!loaded) {
    return (
      <>
        <PageSection variant="default">
          <Title headingLevel="h1">{t('Topology')}</Title>
        </PageSection>
        <PageSection isFilled>
          <Bullseye><Spinner size="xl" /></Bullseye>
        </PageSection>
      </>
    );
  }

  if (!model || !model.nodes || model.nodes.length === 0) {
    return (
      <>
        <PageSection variant="default">
          <Title headingLevel="h1">{t('Topology')}</Title>
        </PageSection>
        <PageSection>
          <EmptyState variant="lg" titleText={t('No resources found')} headingLevel="h2">
            <EmptyStateBody>
              {t('No Gateways or HTTPRoutes found to display in the topology graph.')}
            </EmptyStateBody>
          </EmptyState>
        </PageSection>
      </>
    );
  }

  return (
    <>
      <PageSection variant="default">
        <Title headingLevel="h1">{t('Topology')}</Title>
      </PageSection>
      <PageSection isFilled padding={{ default: 'noPadding' }}>
        <TopologyGraph model={model} />
      </PageSection>
    </>
  );
};

const TopologyGraph: React.FC<{ model: Model }> = ({ model }) => {
  const [controller, setController] = React.useState<Visualization | null>(null);

  React.useEffect(() => {
    const viz = new Visualization();
    viz.registerLayoutFactory(layoutFactory);
    viz.registerComponentFactory(componentFactory);
    viz.addEventListener(GRAPH_LAYOUT_END_EVENT, () => {
      viz.getGraph().fit(40);
    });
    viz.fromModel(model, false);
    setController(viz);
  }, [model]);

  if (!controller) return null;

  return (
    <div style={{ height: 'calc(100vh - 200px)', minHeight: 400 }}>
      <VisualizationProvider controller={controller}>
        <VisualizationSurface />
      </VisualizationProvider>
    </div>
  );
};

export default TopologyPage;
