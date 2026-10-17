import { createContext, useContext, useState } from 'react';
import {
  ReactFlow,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './homeCard.css'
const FormContext = createContext(null);

/* Node 1 + 2: "Antibacterial medicine" / "Bacteria" */
function FieldNode({ data }) {
  const { form, handleChange } = useContext(FormContext);
  const { name, label, placeholder } = data;

  return (
    <label className="home-card">
      <span className="home-label">{label}</span>
      <input
        className="home-input nodrag"
        type="text"
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
      />
      {/* edge starts here */}
      <Handle type="source" position={Position.Bottom} />
    </label>
  );
}

/* Node 3: textarea + Go button */
function QueryNode() {
  const { form, handleChange, handleGo, logo } = useContext(FormContext);

  return (
    <div className="home-card">
      {/* both edges end here */}
      <Handle type="target" position={Position.Top} />

      <textarea
        className="home-textarea nodrag nowheel"
        name="query"
        rows={6}
        style={{ width: '100%', boxSizing: 'border-box' }}
        value={form.query}
        onChange={handleChange}
        placeholder="Describe the case or add notes…"
        aria-label="Case details"
      />

      <div className="buttonDiv">
        <button
          className="go-btn nodrag"
          onClick={handleGo}
          aria-label="Go"
        >
          <img className="go-arrow" src={logo} alt="" />
        </button>
      </div>
    </div>
  );
}

// must live OUTSIDE the component, otherwise React Flow remounts the nodes
const nodeTypes = { field: FieldNode, query: QueryNode };

/*
  Layout (all in flow coordinates):
  - top cards: 280px wide each, 80px gap between them -> total width 640
  - bottom card: 520px wide, x = (640 - 520) / 2 = 60 -> centered under the two
*/
const TOP_W = 280;
const GAP = 80;
const TOTAL_W = TOP_W * 2 + GAP; // 640
const BOTTOM_W = 520;

const initialNodes = [
  {
    id: 'medicine',
    type: 'field',
    position: { x: 0, y: 0 },
    style: { width: TOP_W },
    data: {
      name: 'medicine',
      label: 'Antibacterial medicine',
      placeholder: 'e.g. Amoxicillin',
    },
  },
  {
    id: 'bacteria',
    type: 'field',
    position: { x: TOP_W + GAP, y: 0 },
    style: { width: TOP_W },
    data: {
      name: 'bacteria',
      label: 'Bacteria',
      placeholder: 'e.g. E. coli',
    },
  },
  {
    id: 'query',
    type: 'query',
    position: { x: (TOTAL_W - BOTTOM_W) / 2, y: 220 },
    style: { width: BOTTOM_W },
    data: {},
  },
];

const initialEdges = [
  { id: 'medicine-query', source: 'medicine', target: 'query', type: 'smoothstep', animated: true },
  { id: 'bacteria-query', source: 'bacteria', target: 'query', type: 'smoothstep', animated: true },
];

export default function HomeFlow({ form, handleChange, handleGo, logo }) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [hieghtWidth,setHeightWidth]=useState("100%")
  
  return (
    <FormContext.Provider value={{ form, handleChange, handleGo, logo }}>
      {/* width + height are REQUIRED on the parent */}
      <div className="parent">
        <ReactFlow
          fitViewOptions={{ padding: 0.15 }}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          nodesConnectable={false}   // connections are fixed, user can't rewire
          elementsSelectable={false}
          zoomOnScroll={false}       // don't hijack page scrolling
          preventScrolling={false}
        />
      </div>
    </FormContext.Provider>
  );
}