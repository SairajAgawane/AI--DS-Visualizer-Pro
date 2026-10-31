import React, { useState } from 'react';
import { Card, Button, Badge } from './primitives';
import type { LearningStep } from './types';

export const Learning: React.FC = () => {
  const steps: LearningStep[] = [
    {
      id: 'step-1',
      title: 'Initialize Array Pointers',
      description:
        'Set up left pointer i at index 0 and right pointer j at index n-1. These will track the partition boundary during recursive subdivision.',
      codeSnippet: 'int i = low, j = high;\nint pivot = arr[(low + high) / 2];',
      hint: 'Ensure low < high before invoking the partition subroutine to prevent stack overflow.',
      completed: true,
    },
    {
      id: 'step-2',
      title: 'Partition Pivot Comparison',
      description:
        'Compare arr[i] with pivot value. Advance i until an element strictly greater than or equal to pivot is located.',
      codeSnippet: 'while (arr[i] < pivot) {\n    i++; // advance left boundary\n}',
      hint: 'In descending sorting variants, flip the comparison operator from < to >.',
      completed: true,
    },
    {
      id: 'step-3',
      title: 'Right-side Symmetrization',
      description:
        'Decrement j pointer while arr[j] is strictly greater than pivot value to find elements violating the partition rule.',
      codeSnippet: 'while (arr[j] > pivot) {\n    j--; // decrement right boundary\n}',
      hint: 'The pivot itself might be swapped if non-stable partitioning is utilized.',
      completed: false,
    },
    {
      id: 'step-4',
      title: 'Element Swap & Pointer Crossing',
      description:
        'When i <= j, exchange elements arr[i] and arr[j]. Advance both pointers inward to close the search window.',
      codeSnippet: 'if (i <= j) {\n    swap(arr[i], arr[j]);\n    i++;\n    j--;\n}',
      hint: 'Pointer crossing (i > j) signals completion of the current partition cycle.',
      completed: false,
    },
    {
      id: 'step-5',
      title: 'Subarray Recursion & Base Case',
      description:
        'Recursively invoke quicksort on left subarray [low..j] and right subarray [i..high] until base case (subarrays of size <= 1) is achieved.',
      codeSnippet: 'if (low < j) quicksort(arr, low, j);\nif (i < high) quicksort(arr, i, high);',
      hint: 'For worst-case O(N^2) prevention, consider median-of-three or randomized pivot selection.',
      completed: false,
    },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(2);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    'step-1': true,
    'step-2': true,
  });
  const [showHint, setShowHint] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  const handleNext = () => {
    setCompletedSteps((prev) => ({ ...prev, [currentStep.id]: true }));
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setShowHint(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setShowHint(false);
    }
  };

  const handleCopyCode = () => {
    if (currentStep.codeSnippet) {
      navigator.clipboard.writeText(currentStep.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Track Overview Card */}
      <Card className="bg-slate-900/60 border-slate-800 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge color="cyan" size="sm">INTERACTIVE COURSE</Badge>
              <span className="text-xs text-slate-400 font-mono">MODULE 04</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-1">
              Mastering Partition Exchange (Quicksort)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Step-by-step interactive walkthrough with algorithmic verification and invariant tracking.
            </p>
          </div>

          <div className="flex items-center gap-4 min-w-[200px]">
            <div className="flex-1">
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
                <span>Progress</span>
                <span className="text-cyan-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <Badge color={progressPercent === 100 ? 'green' : 'purple'} size="md">
              {completedCount} / {totalSteps} Done
            </Badge>
          </div>
        </div>

        {/* Stepper Dots Track */}
        <div className="grid grid-cols-5 gap-2 mt-6 pt-4 border-t border-slate-800/80">
          {steps.map((st, idx) => {
            const isDone = completedSteps[st.id];
            const isCurrent = idx === currentStepIndex;

            return (
              <button
                key={st.id}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  setShowHint(false);
                }}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/60 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                    : isDone
                    ? 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
                  {isDone ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  ) : null}
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate">{st.title}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main Step Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Step Guide & Code Canvas */}
        <Card
          title={`Step ${currentStepIndex + 1}: ${currentStep.title}`}
          subtitle="Theoretical explanation and structural pattern"
          className="lg:col-span-2 flex flex-col justify-between"
          action={
            <Badge
              color={completedSteps[currentStep.id] ? 'green' : 'cyan'}
              size="sm"
            >
              {completedSteps[currentStep.id] ? 'COMPLETED' : 'IN PROGRESS'}
            </Badge>
          }
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentStep.description}
            </p>

            {/* Code Snippet Box */}
            {currentStep.codeSnippet && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs">
                  <span className="font-mono text-slate-400">algorithm_segment.cpp</span>
                  <button
                    onClick={handleCopyCode}
                    className="text-slate-400 hover:text-cyan-400 transition-colors font-mono text-[11px] flex items-center gap-1"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
                  <code>{currentStep.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* Hint Marker Toggle */}
            {currentStep.hint && (
              <div className="mt-1">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
                >
                  <span>💡</span>
                  <span>{showHint ? 'Hide Expert Hint' : 'Need a hint or invariant check?'}</span>
                </button>

                {showHint && (
                  <div className="mt-2 p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-xs text-amber-200/90 animate-in fade-in duration-150">
                    <span className="font-semibold text-amber-300">Invariant Hint: </span>
                    {currentStep.hint}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stepper Footer Controls */}
          <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-800">
            <Button
              size="sm"
              variant="secondary"
              disabled={currentStepIndex === 0}
              onClick={handlePrev}
            >
              Previous Step
            </Button>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={handleNext}
              >
                {currentStepIndex === totalSteps - 1 ? 'Finish Tutorial' : 'Mark Completed & Next →'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Documentation Popover / Context Cards */}
        <div className="flex flex-col gap-4">
          <Card title="Complexity Invariants" subtitle="Asymptotic runtime boundaries">
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Best Case Time</span>
                <span className="font-mono font-bold text-emerald-400">O(N log N)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Average Time</span>
                <span className="font-mono font-bold text-cyan-400">O(N log N)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Worst Case Time</span>
                <span className="font-mono font-bold text-rose-400">O(N²)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Auxiliary Space</span>
                <span className="font-mono font-bold text-purple-400">O(log N) stack</span>
              </div>
            </div>
          </Card>

          <Card title="Interactive Sandbox" subtitle="Try step locally">
            <p className="text-xs text-slate-400 leading-relaxed">
              You can run this partition logic in the Visualizer Playground at any time with custom inputs to watch the pointers animate live.
            </p>
            <div className="mt-3">
              <Button size="sm" variant="secondary" className="w-full">
                Open in Playground ↗
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
