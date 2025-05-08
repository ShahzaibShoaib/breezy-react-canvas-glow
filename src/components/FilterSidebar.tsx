import React, { useState } from "react";
import { formatDisplayText } from "@/lib/utils";

interface FilterSidebarProps {
  filterTypes: Record<string, { label: string; file: string; path: string[]; type: string }[]>;
  onSelect: (filename: string) => void;
  selectedFile: string | null;
}

const formatType = (type: string) => formatDisplayText(type);

type FilterTreeNode = {
  label: string;
  children?: FilterTreeNode[];
  file?: string;
  type?: string;
  path?: string[];
};

function buildTree(options: { label: string; file: string; path: string[]; type: string }[]) {
  // Build a tree from all paths
  const root: FilterTreeNode[] = [];
  options.forEach(opt => {
    let currentLevel = root;
    opt.path.forEach((segment, i) => {
      let node = currentLevel.find(node => node.label === segment);
      if (!node) {
        node = { label: segment, children: [] };
        currentLevel.push(node);
      }
      if (i === opt.path.length - 1) {
        node.file = opt.file;
        node.type = opt.type;
        node.path = opt.path;
      }
      if (!node.children) node.children = [];
      currentLevel = node.children;
    });
  });
  return root;
}

interface TreeNodeProps {
  node: FilterTreeNode;
  onSelect: (filename: string) => void;
  selectedFile: string | null;
  level?: number;
  expandedPaths: Set<string>;
  toggleExpand: (pathKey: string) => void;
  parentPath?: string[];
}
const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  onSelect,
  selectedFile,
  level = 0,
  expandedPaths,
  toggleExpand,
  parentPath = [],
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const pathKey = [...parentPath, node.label].join("/");

  return (
    <li>
      <div 
        className="flex items-center group" 
        style={{ paddingLeft: `${8 + level * 16}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => toggleExpand(pathKey)}
            className="inline-flex items-center mr-1 text-gray-500 hover:text-indigo-600 focus:outline-none"
            aria-label={expandedPaths.has(pathKey) ? "Collapse" : "Expand"}
          >
            <span>
              {expandedPaths.has(pathKey) ? (
                <svg width="16" height="16" className="inline-block"><use href="#chevron-down" /></svg>
              ) : (
                <svg width="16" height="16" className="inline-block"><use href="#chevron-right" /></svg>
              )}
            </span>
          </button>
        ) : (
          <span className="inline-block w-6" />
        )}
        {node.file ? (
          <button
            className={`text-left text-sm w-full px-2 py-1 rounded 
            ${selectedFile === node.file ? "bg-indigo-100 text-indigo-700 font-bold" : "hover:bg-gray-100"}`}
            onClick={() => onSelect(node.file!)}
          >
            {node.label}
          </button>
        ) : (
          <span className="text-gray-700 text-sm">{node.label}</span>
        )}
      </div>
      {hasChildren && expandedPaths.has(pathKey) && (
        <ul>
          {node.children!.map((child) => (
            <TreeNode
              key={child.label}
              node={child}
              onSelect={onSelect}
              selectedFile={selectedFile}
              level={level + 1}
              expandedPaths={expandedPaths}
              toggleExpand={toggleExpand}
              parentPath={[...parentPath, node.label]}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filterTypes,
  onSelect,
  selectedFile,
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const toggleExpand = (pathKey: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(pathKey)) next.delete(pathKey);
      else next.add(pathKey);
      return next;
    });
  };

  return (
    <aside className="w-full md:w-64 bg-white rounded-lg shadow p-4 mb-4 md:mb-0">
      <svg style={{ display: "none" }}>
        <symbol id="chevron-down" viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </symbol>
        <symbol id="chevron-right" viewBox="0 0 24 24">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </symbol>
      </svg>
      <h2 className="font-bold text-lg mb-2">Filters</h2>
      <div>
        {Object.keys(filterTypes).length === 0 ? (
          <div className="text-gray-400 text-sm">No filters available</div>
        ) : (
          Object.entries(filterTypes).map(([type, options]) => (
            <div key={type} className="mb-4">
              <div className="font-medium mb-1">{formatType(type)}</div>
              {options.length > 0 ? (
                <ul className="space-y-1">
                  {
                    buildTree(options).map((node) => (
                      <TreeNode
                        key={node.label}
                        node={node}
                        onSelect={onSelect}
                        selectedFile={selectedFile}
                        expandedPaths={expandedPaths}
                        toggleExpand={toggleExpand}
                        parentPath={[]}
                      />
                    ))
                  }
                </ul>
              ) : (
                <div className="text-gray-400 text-sm">No {formatType(type).toLowerCase()} filters</div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default FilterSidebar;
