FROM registry.access.redhat.com/ubi9/nodejs-22:latest AS build
USER root

COPY . /usr/src/app
WORKDIR /usr/src/app
RUN npm ci && npm run build

FROM registry.access.redhat.com/ubi9/nginx-120:latest

# Custom nginx config: listens on 9001 with TLS (serving cert mounted by the
# Deployment from the openshift-service-ca-managed Secret at /var/serving-cert),
# roots at /usr/share/nginx/html, adds CORS for the Console iframe. The
# OpenShift Console requires HTTPS for plugin backends — the default ubi9/nginx
# config (port 8080 HTTP, root /opt/app-root/src) does NOT satisfy that and
# was the root cause of "Failed to get a valid plugin manifest" errors.
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
USER 1001

ENTRYPOINT ["nginx", "-g", "daemon off;"]
