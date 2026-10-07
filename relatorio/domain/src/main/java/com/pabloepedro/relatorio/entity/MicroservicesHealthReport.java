package com.pabloepedro.relatorio.entity;

import java.util.List;

// Guarda a situação de funcionamento (saúde, porta, latência) de cada microsserviço
public class MicroservicesHealthReport {
    private String clusterName;
    private int totalNodes;
    private int activeNodes;
    private List<NodeHealth> nodes;

    // Construtor vazio padrão
    public MicroservicesHealthReport() {}

    // Construtor com o status geral do cluster de microsserviços
    public MicroservicesHealthReport(String clusterName, int totalNodes, int activeNodes, List<NodeHealth> nodes) {
        this.clusterName = clusterName;
        this.totalNodes = totalNodes;
        this.activeNodes = activeNodes;
        this.nodes = nodes;
    }

    // Getters e Setters
    public String getClusterName() { return clusterName; }
    public void setClusterName(String clusterName) { this.clusterName = clusterName; }

    public int getTotalNodes() { return totalNodes; }
    public void setTotalNodes(int totalNodes) { this.totalNodes = totalNodes; }

    public int getActiveNodes() { return activeNodes; }
    public void setActiveNodes(int activeNodes) { this.activeNodes = activeNodes; }

    public List<NodeHealth> getNodes() { return nodes; }
    public void setNodes(List<NodeHealth> nodes) { this.nodes = nodes; }

    // Representa um microsserviço individual (ex: auth porta 8081, estoque 8082...)
    public static class NodeHealth {
        private String id;
        private String name;
        private int port;
        private String technology;
        private String status;
        private double latencyMs;

        public NodeHealth() {}

        public NodeHealth(String id, String name, int port, String technology, String status, double latencyMs) {
            this.id = id;
            this.name = name;
            this.port = port;
            this.technology = technology;
            this.status = status;
            this.latencyMs = latencyMs;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public int getPort() { return port; }
        public void setPort(int port) { this.port = port; }

        public String getTechnology() { return technology; }
        public void setTechnology(String technology) { this.technology = technology; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public double getLatencyMs() { return latencyMs; }
        public void setLatencyMs(double latencyMs) { this.latencyMs = latencyMs; }
    }
}

