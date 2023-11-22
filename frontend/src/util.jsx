export const mockConf = `# TRY ME!
static_resources:
  listeners:
    - address:
        socket_address:
          address: 0.0.0.0
          port_value: 9999
      filter_chains:
        - filters:
            - name: envoy.filters.network.http_connection_manager
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                codec_type: AUTO
                stat_prefix: ingress
                route_config:
                  name: ingress
                  virtual_hosts:
                    - name: backend
                      domains:
                        - "*"
                      routes:
                        - match:
                            prefix: "/"
                          direct_response:
                            status: "200"
                            body:
                              inline_string: "Hello World"
                http_filters:
                  - name: envoy.filters.http.router
                    typed_config: {}
admin:
  access_log_path: "/dev/null"
  address:
    socket_address:
      address: 0.0.0.0
      port_value: 8001
`;

export const linterBaseUrl =
  "https://wco1jydmml.execute-api.us-east-1.amazonaws.com/dev";
  // "https://w10hbo299d.execute-api.us-east-1.amazonaws.com/prod";

export const SUPPORTED_VERS = [
  "v1.28.0",
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
