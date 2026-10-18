import { createContext, useContext, useState } from 'react';
import {
  ReactFlow,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './homeCard.css';
import InputSuggestionBackend from './SubComponent/InputFiledSuggestion/InputSuggestion';
import { useAtom } from 'jotai';
import { antibiotics, organismName } from '../../../../Atoms/atoms';

const FormContext = createContext(null);

/* Node 1 + 2: Antibacterial medicine / Bacteria */
function FieldNode({ data }) {
  const { form, handleChange } = useContext(FormContext);
  const { name, label, placeholder, type } = data;

  return (
    <label className="home-card nodrag">
      <span className="home-label">{label}</span>

      <InputSuggestionBackend
        name={name}
        form={form}
        handleChange={handleChange}
        placeholder={placeholder}
        type={type}
      />

      <Handle type="source" position={Position.Bottom} />
    </label>
  );
}

/* Node 3: Case details + Go button */
function QueryNode() {
  const { form, handleChange, handleGo, logo } =
    useContext(FormContext);

  return (
    <div className="home-card nodrag">
      <Handle type="target" position={Position.Top} />

      <textarea
        className="home-textarea nodrag nowheel"
        name="query"
        rows={6}
        style={{
          width: "100%",
          boxSizing: "border-box",
        }}
        value={form.query}
        onChange={handleChange}
        placeholder="Describe the case or add notes…"
        aria-label="Case details"
      />

      <div className="buttonDiv">
        <button
          type="button"
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

const nodeTypes = {
  field: FieldNode,
  query: QueryNode,
};

const TOP_W = 180;
const GAP = 30;
const TOTAL_W = TOP_W * 2 + GAP;
const BOTTOM_W = 300;

const initialNodes = [
  {
    id: "medicine",
    type: "field",
    position: { x: 0, y: 0 },
    style: { width: TOP_W },
    data: {
      name: "antibiotic",
      label: "Antibacterial medicine",
      placeholder: "e.g. Amoxicillin",
      type: "antibiotic",
    },
  },
  {
    id: "bacteria",
    type: "field",
    position: { x: TOP_W + GAP, y: 0 },
    style: { width: TOP_W },
    data: {
      name: "organism",
      label: "Bacteria",
      placeholder: "e.g. E. coli",
      type: "organism",
    },
  },
  {
    id: "query",
    type: "query",
    position: {
      x: (TOTAL_W - BOTTOM_W) / 2,
      y: 220,
    },
    style: { width: BOTTOM_W },
    data: {},
  },
];

const initialEdges = [
  {
    id: "medicine-query",
    source: "medicine",
    target: "query",
    type: "smoothstep",
    animated: true,
  },
  {
    id: "bacteria-query",
    source: "bacteria",
    target: "query",
    type: "smoothstep",
    animated: true,
  },
];

export default function HomeFlow({
  form,
  handleChange,
  handleGo,
  logo,
}) {
  const [nodes, , onNodesChange] =
    useNodesState(initialNodes);

  const [edges, , onEdgesChange] =
    useEdgesState(initialEdges);

  return (
    <FormContext.Provider
      value={{
        form,
        handleChange,
        handleGo,
        logo,
      }}
    >
      <div className="parent">
        <ReactFlow
          fitViewOptions={{ padding: 0.15 }}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          preventScrolling={false}
        />
      </div>
    </FormContext.Provider>
  );
}