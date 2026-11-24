FROM ghcr.io/graalvm/native-image-community:21 AS builder
WORKDIR /app

ARG MAVEN_VERSION=3.9.16
RUN microdnf install -y tar gzip && \
    curl -fsSL "https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz" -o /tmp/maven.tar.gz && \
    tar -xzf /tmp/maven.tar.gz -C /opt && \
    ln -s "/opt/apache-maven-${MAVEN_VERSION}" /opt/maven && \
    rm /tmp/maven.tar.gz
ENV PATH="/opt/maven/bin:${PATH}"

COPY pom.xml .
COPY domain/pom.xml domain/pom.xml
COPY spring/pom.xml spring/pom.xml

COPY domain/src domain/src
COPY spring/src spring/src

RUN mvn -pl domain -am clean install -DskipTests
RUN mvn -pl spring -Pnative native:compile -DskipTests

FROM debian:bookworm-slim AS runner
WORKDIR /app
EXPOSE 8080

COPY --from=builder /app/spring/target/estoque-spring /app/estoque-spring

ENTRYPOINT ["./estoque-spring"]
