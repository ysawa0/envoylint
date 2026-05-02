# Define custom function directory
ARG FUNCTION_DIR="/function"

# Use a slim version of Python for building
FROM python:3.11-slim as build-image

# Include global arg in this stage of the build
ARG FUNCTION_DIR

# Copy function code
RUN mkdir -p ${FUNCTION_DIR}
# COPY . ${FUNCTION_DIR}

# Install the function's dependencies, then clean up the cache to reduce size
RUN pip install --target ${FUNCTION_DIR} awslambdaric && \
    pip cache purge

# Use Envoy's slim image if available, otherwise, stick with the current image
# FROM envoyproxy/envoy-contrib:v1.28.0-slim as envoy
FROM envoyproxy/envoy-contrib:v1.28.0 as envoy

# Final base image
FROM python:3.11-slim

# Copy Envoy binary
COPY --from=envoy /usr/local/bin/envoy /usr/local/bin/envoy

# Include global arg in this stage of the build
ARG FUNCTION_DIR

# Set working directory to function root directory
WORKDIR ${FUNCTION_DIR}

# Copy in the built dependencies from the build image
COPY --from=build-image ${FUNCTION_DIR} ${FUNCTION_DIR}

# Set the entrypoint for the Lambda Runtime Interface Client
ENTRYPOINT ["/usr/local/bin/python", "-m", "awslambdaric"]

# Copy handler function
COPY apig.py ${FUNCTION_DIR}
COPY main.py ${FUNCTION_DIR}

# Set the handler function
CMD ["main.handler"]
