import React, { useState, useEffect } from 'react';
import { X, Plus, Upload, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'sonner';
import { Lab, LabInstruction } from './types';
import { InstructionCard } from './shared/InstructionCard';
import LabService from '../../../../services/api/labService';

interface InstructionEditorProps {
  isOpen: boolean;
  lab: Lab;
  onClose: () => void;
  onInstructionsUpdated: () => void;
}

interface EditingInstruction {
  id: string;
  instructionText: string;
  orderIndex: number;
}

export function InstructionEditor({
  isOpen,
  lab,
  onClose,
  onInstructionsUpdated,
}: InstructionEditorProps) {
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  const { t } = useLanguage();

  // State management
  const [instructions, setInstructions] = useState<LabInstruction[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  // Add form state
  const [newInstructionText, setNewInstructionText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Edit form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Load instructions when modal opens
  useEffect(() => {
    if (isOpen && lab?.id) {
      loadInstructions();
    }
  }, [isOpen, lab?.id]);

  const loadInstructions = async () => {
    setLoading(true);
    try {
      const data = await LabService.getInstructions(lab.id);
      // Sort by orderIndex to ensure correct order
      const sorted = [...data].sort((a, b) => a.orderIndex - b.orderIndex);
      setInstructions(sorted);
    } catch (error) {
      console.error('Error loading instructions:', error);
      toast.error(t('errorLoadingInstructions') || 'Failed to load instructions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstruction = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!newInstructionText.trim() && !selectedFile) {
      toast.error(
        t('instructionTextOrFileRequired') || 'Please enter instruction text or upload a file'
      );
      return;
    }

    setAdding(true);
    try {
      const nextOrderIndex = instructions.length;

      let newInstruction: LabInstruction;

      if (selectedFile) {
        setUploadingFile(true);
        try {
          const uploadResponse = await LabService.uploadInstructionFile(lab.id, selectedFile, {
            title: newInstructionText.trim() || selectedFile.name,
            orderIndex: nextOrderIndex,
          });
          newInstruction = uploadResponse.instruction;
        } catch (error) {
          console.error('Error uploading file:', error);
          toast.error(t('errorUploadingFile') || 'Failed to upload file');
          return;
        } finally {
          setUploadingFile(false);
        }
      } else {
        // Add text-only instruction
        newInstruction = await LabService.addInstruction(lab.id, {
          instructionText: newInstructionText.trim(),
          orderIndex: nextOrderIndex,
        });
      }

      // Update local state
      setInstructions([...instructions, newInstruction]);

      // Reset form
      setNewInstructionText('');
      setSelectedFile(null);
      toast.success(t('instructionAdded') || 'Instruction added successfully');

      // Call callback
      onInstructionsUpdated();
    } catch (error) {
      console.error('Error adding instruction:', error);
      toast.error(t('errorAddingInstruction') || 'Failed to add instruction');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteInstruction = async (instructionId: string) => {
    try {
      await LabService.deleteInstruction(lab.id, instructionId);
      setInstructions(instructions.filter((i) => i.id !== instructionId));
      toast.success(t('instructionDeleted') || 'Instruction deleted successfully');
      onInstructionsUpdated();
    } catch (error) {
      console.error('Error deleting instruction:', error);
      toast.error(t('errorDeletingInstruction') || 'Failed to delete instruction');
    }
  };

  const handleEditInstruction = (instruction: LabInstruction) => {
    setEditingId(instruction.id);
    setEditingText(instruction.instructionText || '');
  };

  const handleUpdateInstruction = async (instructionId: string) => {
    if (!editingText.trim()) {
      toast.error(t('instructionTextRequired') || 'Instruction text is required');
      return;
    }

    try {
      const instruction = instructions.find((i) => i.id === instructionId);
      if (!instruction) return;

      await LabService.updateInstruction(lab.id, instructionId, {
        instructionText: editingText.trim(),
      });

      // Update local state
      setInstructions(
        instructions.map((i) =>
          i.id === instructionId
            ? { ...i, instructionText: editingText.trim() }
            : i
        )
      );

      setEditingId(null);
      setEditingText('');
      toast.success(t('instructionUpdated') || 'Instruction updated successfully');
      onInstructionsUpdated();
    } catch (error) {
      console.error('Error updating instruction:', error);
      toast.error(t('errorUpdatingInstruction') || 'Failed to update instruction');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="instruction-editor-modal-title"
    >
      <div
        className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
          isDark ? 'bg-slate-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b sticky top-0 ${
            isDark ? 'border-white/10 bg-slate-900' : 'border-gray-200 bg-white'
          }`}
        >
          <div>
            <h2
              id="instruction-editor-modal-title"
              className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {t('manageInstructions') || 'Manage Instructions'}
            </h2>
            <p
              className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
            >
              {lab.title}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t('close') || 'Close'}
            className={`p-1 rounded hover:bg-opacity-20 transition-colors ${
              isDark ? 'text-slate-400 hover:bg-white' : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}

          {!loading && (
            <>
              {/* Instructions List */}
              <div className="mb-8">
                {instructions.length === 0 ? (
                  <div
                    className={`text-center py-12 rounded-lg border-2 border-dashed ${
                      isDark
                        ? 'border-slate-700 bg-slate-800/30'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <p
                      className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                    >
                      {t('noInstructions') || 'No instructions yet. Add your first instruction below.'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3
                      className={`text-lg font-semibold mb-4 ${
                        isDark ? 'text-slate-200' : 'text-gray-900'
                      }`}
                    >
                      {t('currentInstructions') || 'Current Instructions'}
                    </h3>
                    <div className="space-y-3">
                      {instructions.map((instruction, idx) => (
                        <div key={instruction.id}>
                          {editingId === instruction.id ? (
                            // Edit form
                            <div
                              className={`rounded-lg border p-4 ${
                                isDark
                                  ? 'bg-slate-800/50 border-slate-700'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="mb-3">
                                <label
                                  htmlFor={`edit-text-${instruction.id}`}
                                  className={`block text-sm font-medium mb-2 ${
                                    isDark ? 'text-slate-300' : 'text-gray-700'
                                  }`}
                                >
                                  {t('instructionText') || 'Instruction Text'}
                                </label>
                                <textarea
                                  id={`edit-text-${instruction.id}`}
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    isDark
                                      ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
                                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                  }`}
                                  rows={3}
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditingText('');
                                  }}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isDark
                                      ? 'bg-slate-700 text-white hover:bg-slate-600'
                                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                                  }`}
                                >
                                  {t('cancel') || 'Cancel'}
                                </button>
                                <button
                                  onClick={() => handleUpdateInstruction(instruction.id)}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${
                                    isDark ? 'hover:bg-blue-600' : 'hover:bg-blue-600'
                                  }`}
                                  style={{ backgroundColor: primaryHex || '#3b82f6' }}
                                >
                                  {t('save') || 'Save'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Display card
                            <InstructionCard
                              instruction={instruction}
                              index={idx}
                              showActions={true}
                              onEdit={handleEditInstruction}
                              onDelete={handleDeleteInstruction}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Add New Instruction Form */}
              <div
                className={`rounded-lg border-2 border-dashed p-6 ${
                  isDark ? 'border-slate-700 bg-slate-800/20' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 ${
                    isDark ? 'text-slate-200' : 'text-gray-900'
                  }`}
                >
                  <Plus className="inline-block w-5 h-5 mr-2" />
                  {t('addNewInstruction') || 'Add New Instruction'}
                </h3>

                <form onSubmit={handleAddInstruction} className="space-y-4">
                  {/* Instruction Text */}
                  <div>
                    <label
                      htmlFor="new-instruction-text"
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}
                    >
                      {t('instructionText') || 'Instruction Text'} *
                    </label>
                    <textarea
                      id="new-instruction-text"
                      value={newInstructionText}
                      onChange={(e) => setNewInstructionText(e.target.value)}
                      placeholder={t('instructionTextPlaceholder') || 'Enter instruction text...'}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                      rows={4}
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label
                      htmlFor="instruction-file"
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}
                    >
                      {t('attachFile') || 'Attach File (Optional)'}
                    </label>
                    <div className="relative">
                      <input
                        id="instruction-file"
                        type="file"
                        onChange={handleFileSelect}
                        disabled={uploadingFile}
                        className="hidden"
                        accept="*/*"
                      />
                      <label
                        htmlFor="instruction-file"
                        className={`block px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer text-center transition-colors ${
                          isDark
                            ? 'border-slate-600 hover:border-blue-500 hover:bg-blue-500/10'
                            : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {uploadingFile ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                              <span
                                className={`text-sm ${
                                  isDark ? 'text-slate-400' : 'text-gray-600'
                                }`}
                              >
                                {t('uploading') || 'Uploading...'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
                              <span
                                className={`text-sm ${
                                  isDark ? 'text-slate-300' : 'text-gray-700'
                                }`}
                              >
                                {selectedFile
                                  ? selectedFile.name
                                  : t('clickOrDragFile') || 'Click to upload or drag and drop'}
                              </span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Auto-calculated order index */}
                  <div>
                    <p
                      className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}
                    >
                      {t('orderPosition') || 'Order Position'}: {instructions.length + 1}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={adding || uploadingFile}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark ? 'hover:bg-blue-600' : 'hover:bg-blue-600'
                    }`}
                    style={{
                      backgroundColor: primaryHex || '#3b82f6',
                    }}
                  >
                    {adding || uploadingFile ? (
                      <>
                        <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
                        {t('adding') || 'Adding...'}
                      </>
                    ) : (
                      <>
                        <Plus className="inline-block w-4 h-4 mr-2" />
                        {t('addInstruction') || 'Add Instruction'}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructionEditor;
