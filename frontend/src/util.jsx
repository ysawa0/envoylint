export const mockConf = `# TRY ME!
static_resources:
  listeners:
  - address:
      socket_address:
        address: 0.0.0.0
        port_value: 8000
    filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_manager
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          codec_type: AUTO
          stat_prefix: ingress_http
          route_config:
            name: local_route
            virtual_hosts:
            - name: backend
              domains:
              - "*"
              routes:
              - match:
                  prefix: "/service/1"
                route:
                  cluster: service1
              - match:
                  prefix: "/service/2"
                route:
                  cluster: service2
          http_filters:
          - name: "envoy.filters.http.cache"
            typed_config:
              "@type": "type.googleapis.com/envoy.extensions.filters.http.cache.v3.CacheConfig"
              typed_config:
                "@type": "type.googleapis.com/envoy.extensions.http.cache.simple_http_cache.v3.SimpleHttpCacheConfig"
          - name: envoy.filters.http.router
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.filters.http.router.v3.Router

  clusters:
  - name: service1
    type: STRICT_DNS
    lb_policy: ROUND_ROBIN
    load_assignment:
      cluster_name: service1
      endpoints:
      - lb_endpoints:
        - endpoint:
            address:
              socket_address:
                address: service1
                port_value: 8080
  - name: service2
    type: STRICT_DNS
    lb_policy: ROUND_ROBIN
    load_assignment:
      cluster_name: service2
      endpoints:
      - lb_endpoints:
        - endpoint:
            address:
              socket_address:
                address: service2
                port_value: 8080
`;

export const linterBaseUrl = "https://w10hbo299d.execute-api.us-east-1.amazonaws.com/prod";

export const SUPPORTED_VERS = [
  "v1.28.0",
  // "v1.27.2",
  "v1.23.1",
  "v1.22.0",
  "v1.21.0",
  "v1.20.0",
  "v1.19.0",
  "v1.18.2",
  "v1.17.1",
  "v1.16.2",
  "v1.14.5",
  "v1.13.4",
  "v1.12.7",
];
