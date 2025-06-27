import React from "react";
import { ConnectionsGraph } from "./ConnectionsGraph";
import connectionsData from "./connections.json";

export default function ConnectionsGraphDemo() {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        Project Connections Graph Demo
      </h1>
      <p style={{ marginBottom: 24, color: '#555' }}>
        This diagram visualizes the main architectural components and their connections in the project.
      </p>
      <ConnectionsGraph data={connectionsData} width={900} height={600} />
      <div style={{ marginTop: 16, color: '#777', fontSize: 13 }}>
        <strong>Legend:</strong> Each node is a main system component (app, modules, server, plugins, etc).<br />
        Arrows represent the type of connection (e.g., calls, registers, augments, emits).
      </div>
    </div>
  );
}
