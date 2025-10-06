"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Database, Key, Link, Hash } from "lucide-react";
import { useProjects } from "@/providers/ProjectContext";
import axios from "@/utils/axios";

const DatabaseSchemaNode = ({ data }) => {
  const schema = data?.schema || []; // default to empty array

  return (
    <div
      className="rounded-xl border shadow-sm bg-card text-foreground w-[230px] overflow-hidden"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
    >
      <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 border-b border-border">
        <Database size={16} className="text-primary" />
        <span className="font-semibold text-sm">{data?.label || "No Name"}</span>
      </div>
      <div className="p-2">
        {schema.map((col, i) => (
          <div
            key={i}
            className="relative flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-primary/10"
          >
            <Handle
              type="target"
              id={col.title}
              position={Position.Left}
              style={{ background: "var(--primary)" }}
            />
            <div className="flex items-center gap-1">
              {col.key === "PK" ? (
                <Key size={12} className="text-yellow-500" />
              ) : col.key === "FK" ? (
                <Link size={12} className="text-blue-500" />
              ) : (
                <Hash size={12} className="text-secondary" />
              )}
              <span>{col.title}</span>
            </div>
            <span className="text-muted-foreground text-[11px]">{col.type}</span>
            <Handle
              type="source"
              id={col.title}
              position={Position.Right}
              style={{ background: "var(--primary)" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SchemaVisualizer() {
  const { selectedProject } = useProjects();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [schemaName, setSchemaName] = useState("Database Schema");

  useEffect(() => {
    if (!selectedProject) return;

    const fetchSchema = async () => {
      try {
        const res = await axios.get(
          `/schema/${selectedProject.project_id}/schema-structure`
        );

        const data = res.data.data;

        const apiNodes = (data.nodes || []).map((node) => ({
          id: node.id,
          type: node.type || "databaseSchema",
          position: node.position || { x: 0, y: 0 },
          data: {
            label: node.data?.label || "No Name",
            schema: node.data?.schema || [],
          },
        }));

        const apiEdges = (data.edges || []).map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          animated: edge.animated ?? true,
          type: edge.type || "smoothstep",
          style: edge.style || { stroke: "var(--primary)", strokeWidth: 2 },
          markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed, color: "var(--primary)" },
        }));
         
        setNodes(apiNodes);
        setEdges(apiEdges);
        setSchemaName(res.data.data.schemaName || "Database Schema");
      } catch (error) {
        console.error("Error fetching schema structure:", error);
      }
    };

    fetchSchema();
  }, [selectedProject]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed, color: "var(--primary)" },
            style: { stroke: "var(--primary)", strokeWidth: 2 },
          },
          eds
        )
      ),
    []
  );

  return (
    <div className="bg-background text-foreground h-[100vh] relative overflow-hidden">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl font-bold text-primary select-none z-10">
        {schemaName}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{ databaseSchema: DatabaseSchemaNode }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable
        panOnDrag
        zoomOnScroll
        zoomOnPinch
      >
        <Background color="var(--muted-foreground)" gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}
