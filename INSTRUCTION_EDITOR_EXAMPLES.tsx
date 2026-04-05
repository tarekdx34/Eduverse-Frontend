/**
 * InstructionEditor Integration Example
 * Shows how to integrate InstructionEditor into your component
 */

import React, { useState } from 'react';
import { InstructionEditor } from './components/labs/InstructionEditor';
import { Lab } from './components/labs/types';

/**
 * Example 1: Basic Usage
 */
export function Example1_BasicUsage() {
  const [showInstructionEditor, setShowInstructionEditor] = useState(false);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);

  const handleManageInstructions = (lab: Lab) => {
    setSelectedLab(lab);
    setShowInstructionEditor(true);
  };

  return (
    <>
      {/* Button to open editor */}
      <button onClick={() => handleManageInstructions(selectedLab!)}>
        Manage Instructions
      </button>

      {/* InstructionEditor Modal */}
      <InstructionEditor
        isOpen={showInstructionEditor}
        lab={selectedLab!}
        onClose={() => setShowInstructionEditor(false)}
        onInstructionsUpdated={() => {
          // Refresh lab data or UI after instructions are updated
          console.log('Instructions updated!');
        }}
      />
    </>
  );
}

/**
 * Example 2: Integration with LabDetail Component
 * This shows how to connect InstructionEditor with the existing LabDetail component
 */
export function Example2_LabDetailIntegration() {
  const [showDetail, setShowDetail] = useState(false);
  const [showInstructionEditor, setShowInstructionEditor] = useState(false);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);

  const handleViewLabDetails = (lab: Lab) => {
    setSelectedLab(lab);
    setShowDetail(true);
  };

  const handleManageInstructions = () => {
    if (selectedLab) {
      setShowDetail(false); // Close detail view
      setShowInstructionEditor(true); // Open instruction editor
    }
  };

  return (
    <>
      {/* Lab Detail Modal with onManageInstructions callback */}
      {/* <LabDetail
        isOpen={showDetail}
        lab={selectedLab}
        onClose={() => setShowDetail(false)}
        onManageInstructions={handleManageInstructions}
        onEditClick={() => {}}
        onViewSubmissions={() => {}}
        onUploadTaMaterials={() => {}}
        onViewAttendance={() => {}}
      /> */}

      {/* InstructionEditor Modal */}
      <InstructionEditor
        isOpen={showInstructionEditor}
        lab={selectedLab!}
        onClose={() => {
          setShowInstructionEditor(false);
          // Optionally reopen lab detail
          setShowDetail(true);
        }}
        onInstructionsUpdated={() => {
          console.log('Instructions updated!');
          // Refresh lab data if needed
        }}
      />
    </>
  );
}

/**
 * Example 3: Full LabsDashboard Integration
 * Shows how to integrate into the main dashboard
 */
export function Example3_LabsDashboardIntegration() {
  const [showInstructionEditor, setShowInstructionEditor] = useState(false);
  const [selectedLabForInstructions, setSelectedLabForInstructions] = useState<Lab | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);

  const handleManageInstructions = (lab: Lab) => {
    setSelectedLabForInstructions(lab);
    setShowInstructionEditor(true);
  };

  const handleInstructionsUpdated = () => {
    // Refresh labs to get updated instruction counts
    // You would typically call your labs API here
    console.log('Refreshing labs...');
    // const updatedLabs = await LabService.getAll();
    // setLabs(updatedLabs);
  };

  return (
    <>
      {/* Render labs list */}
      <div className="grid gap-4">
        {labs.map((lab) => (
          <div key={lab.id} className="p-4 border rounded">
            <h3>{lab.title}</h3>
            <p>Instructions: {lab.instructions?.length || 0}</p>
            <button
              onClick={() => handleManageInstructions(lab)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Manage Instructions
            </button>
          </div>
        ))}
      </div>

      {/* InstructionEditor Modal */}
      {selectedLabForInstructions && (
        <InstructionEditor
          isOpen={showInstructionEditor}
          lab={selectedLabForInstructions}
          onClose={() => setShowInstructionEditor(false)}
          onInstructionsUpdated={handleInstructionsUpdated}
        />
      )}
    </>
  );
}

/**
 * Example 4: With Type-Safe Lab Management
 * Shows a more complete implementation with proper types
 */
interface LabsState {
  list: Lab[];
  selected: Lab | null;
  loading: boolean;
  error: string | null;
}

export function Example4_TypeSafeImplementation() {
  const [state, setState] = React.useState<LabsState>({
    list: [],
    selected: null,
    loading: false,
    error: null,
  });

  const [showInstructionEditor, setShowInstructionEditor] = useState(false);

  const handleManageInstructions = (lab: Lab) => {
    setState((prev) => ({ ...prev, selected: lab }));
    setShowInstructionEditor(true);
  };

  const refreshLabs = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // const labs = await LabService.getAll();
      // setState((prev) => ({ ...prev, list: labs, loading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  React.useEffect(() => {
    refreshLabs();
  }, []);

  return (
    <>
      {state.loading && <div>Loading...</div>}
      {state.error && <div className="text-red-500">{state.error}</div>}

      <div className="grid gap-4">
        {state.list.map((lab) => (
          <div
            key={lab.id}
            className="p-4 border rounded cursor-pointer hover:bg-gray-50"
          >
            <h3 className="font-bold">{lab.title}</h3>
            <p className="text-sm text-gray-600">{lab.description}</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleManageInstructions(lab)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Manage Instructions ({lab.instructions?.length || 0})
              </button>
            </div>
          </div>
        ))}
      </div>

      {state.selected && (
        <InstructionEditor
          isOpen={showInstructionEditor}
          lab={state.selected}
          onClose={() => setShowInstructionEditor(false)}
          onInstructionsUpdated={refreshLabs}
        />
      )}
    </>
  );
}

/**
 * Example 5: With Form Validation Enhancement
 * Shows how to add additional validation before opening
 */
export function Example5_WithValidation() {
  const [showInstructionEditor, setShowInstructionEditor] = useState(false);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);

  const handleManageInstructions = (lab: Lab) => {
    // Validate lab has required fields
    if (!lab.id) {
      console.error('Lab must have an id');
      return;
    }

    if (!lab.title) {
      console.error('Lab must have a title');
      return;
    }

    setSelectedLab(lab);
    setShowInstructionEditor(true);
  };

  return (
    <>
      <InstructionEditor
        isOpen={showInstructionEditor}
        lab={selectedLab!}
        onClose={() => setShowInstructionEditor(false)}
        onInstructionsUpdated={() => {
          // Handle successful update
          console.log('Instructions updated successfully');
        }}
      />
    </>
  );
}

export default Example1_BasicUsage;
