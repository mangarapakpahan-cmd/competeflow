"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  Competition,
  Task,
  VaultFile,
  ExpenseRecord,
  Retrospective,
} from "@/types";
import {
  initialCompetitions,
  initialTasks,
  initialVaultFiles,
  initialExpenses,
  initialRetrospectives,
} from "@/lib/mock-data";
import {
  loadStateFromFirestore,
  saveStateToFirestore,
} from "@/lib/firebase/firestore";

// ============================================================================
// State Shape
// ============================================================================

interface AppState {
  competitions: Competition[];
  tasks: Task[];
  vaultFiles: VaultFile[];
  expenses: ExpenseRecord[];
  retrospectives: Retrospective[];
  isDemoMode: boolean;
}

const STORAGE_KEY = "competeflow_data_v1";

const defaultInitialState: AppState = {
  competitions: initialCompetitions,
  tasks: initialTasks,
  vaultFiles: initialVaultFiles,
  expenses: initialExpenses,
  retrospectives: initialRetrospectives,
  isDemoMode: true,
};

// ============================================================================
// Actions
// ============================================================================

type Action =
  | { type: "SET_ALL_DATA"; payload: Partial<AppState> }
  // Competitions
  | { type: "ADD_COMPETITION"; payload: Competition }
  | { type: "UPDATE_COMPETITION"; payload: Competition }
  | { type: "DELETE_COMPETITION"; payload: string }
  | { type: "TOGGLE_STAGE"; payload: { compId: string; stageId: string } }
  // Tasks
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "TOGGLE_TASK"; payload: string }
  // Vault
  | { type: "ADD_VAULT_FILE"; payload: VaultFile }
  | { type: "DELETE_VAULT_FILE"; payload: string }
  // Expenses
  | { type: "ADD_EXPENSE"; payload: ExpenseRecord }
  | { type: "UPDATE_EXPENSE"; payload: ExpenseRecord }
  | { type: "DELETE_EXPENSE"; payload: string }
  // Retrospectives
  | { type: "ADD_RETROSPECTIVE"; payload: Retrospective }
  | { type: "UPDATE_RETROSPECTIVE"; payload: Retrospective }
  | { type: "DELETE_RETROSPECTIVE"; payload: string }
  // Reset
  | { type: "RESET_TO_DEFAULT" };

// ============================================================================
// Reducer
// ============================================================================

function appReducer(state: AppState, action: Action): AppState {
  let newState: AppState;

  switch (action.type) {
    case "SET_ALL_DATA":
      return {
        ...state,
        competitions: action.payload.competitions ?? state.competitions,
        tasks: action.payload.tasks ?? state.tasks,
        vaultFiles: action.payload.vaultFiles ?? state.vaultFiles,
        expenses: action.payload.expenses ?? state.expenses,
        retrospectives: action.payload.retrospectives ?? state.retrospectives,
      };

    // --- Competitions ---
    case "ADD_COMPETITION":
      newState = { ...state, competitions: [action.payload, ...state.competitions] };
      break;
    case "UPDATE_COMPETITION":
      newState = {
        ...state,
        competitions: state.competitions.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
      break;
    case "DELETE_COMPETITION":
      newState = {
        ...state,
        competitions: state.competitions.filter((c) => c.id !== action.payload),
      };
      break;
    case "TOGGLE_STAGE":
      newState = {
        ...state,
        competitions: state.competitions.map((c) => {
          if (c.id !== action.payload.compId) return c;
          return {
            ...c,
            stages: c.stages.map((s) =>
              s.id === action.payload.stageId
                ? {
                    ...s,
                    is_completed: !s.is_completed,
                    completed_at: !s.is_completed
                      ? new Date().toISOString()
                      : undefined,
                  }
                : s
            ),
          };
        }),
      };
      break;

    // --- Tasks ---
    case "ADD_TASK":
      newState = { ...state, tasks: [action.payload, ...state.tasks] };
      break;
    case "UPDATE_TASK":
      newState = {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
      break;
    case "DELETE_TASK":
      newState = {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      };
      break;
    case "TOGGLE_TASK":
      newState = {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload
            ? {
                ...t,
                is_completed: !t.is_completed,
                completed_at: !t.is_completed
                  ? new Date().toISOString()
                  : undefined,
              }
            : t
        ),
      };
      break;

    // --- Vault Files ---
    case "ADD_VAULT_FILE":
      newState = { ...state, vaultFiles: [action.payload, ...state.vaultFiles] };
      break;
    case "DELETE_VAULT_FILE":
      newState = {
        ...state,
        vaultFiles: state.vaultFiles.filter((f) => f.id !== action.payload),
      };
      break;

    // --- Expenses ---
    case "ADD_EXPENSE":
      newState = { ...state, expenses: [action.payload, ...state.expenses] };
      break;
    case "UPDATE_EXPENSE":
      newState = {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
      break;
    case "DELETE_EXPENSE":
      newState = {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      };
      break;

    // --- Retrospectives ---
    case "ADD_RETROSPECTIVE":
      newState = {
        ...state,
        retrospectives: [action.payload, ...state.retrospectives],
      };
      break;
    case "UPDATE_RETROSPECTIVE":
      newState = {
        ...state,
        retrospectives: state.retrospectives.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };
      break;
    case "DELETE_RETROSPECTIVE":
      newState = {
        ...state,
        retrospectives: state.retrospectives.filter(
          (r) => r.id !== action.payload
        ),
      };
      break;

    case "RESET_TO_DEFAULT":
      newState = { ...defaultInitialState };
      break;

    default:
      return state;
  }

  // Persist to localStorage immediately
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
    // Sync to Google Firebase Firestore asynchronously if configured
    saveStateToFirestore({
      competitions: newState.competitions,
      tasks: newState.tasks,
      vaultFiles: newState.vaultFiles,
      expenses: newState.expenses,
      retrospectives: newState.retrospectives,
    }).catch((err) => console.warn("Failed to persist to Firestore:", err));

    // Also sync to /api/db asynchronously
    fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        competitions: newState.competitions,
        tasks: newState.tasks,
        vaultFiles: newState.vaultFiles,
        expenses: newState.expenses,
        retrospectives: newState.retrospectives,
      }),
    }).catch((err) => console.warn("Failed to persist to /api/db:", err));
  }

  return newState;
}

// ============================================================================
// Context
// ============================================================================

interface AppStateContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isSynced: boolean;
  resetDatabase: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, defaultInitialState);
  const [isSynced, setIsSynced] = useState(false);

  // Initial load: try localStorage first for speed, then sync with /api/db
  useEffect(() => {
    let loadedFromLocal = false;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          dispatch({ type: "SET_ALL_DATA", payload: parsed });
          loadedFromLocal = true;
          setIsSynced(true);
        } catch (err) {
          console.error("Failed to parse localStorage data:", err);
        }
      }
    }

    // Sync from Google Firebase Firestore if connected
    loadStateFromFirestore()
      .then((firestoreData) => {
        if (firestoreData) {
          dispatch({ type: "SET_ALL_DATA", payload: firestoreData });
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(firestoreData));
          }
          setIsSynced(true);
        }
      })
      .catch((err) => console.warn("Firestore sync check error:", err));

    // Also fetch latest from server /api/db
    fetch("/api/db")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          // If localStorage was empty, initialize with server data
          if (!loadedFromLocal) {
            dispatch({ type: "SET_ALL_DATA", payload: res.data });
            if (typeof window !== "undefined") {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
            }
          }
          setIsSynced(true);
        }
      })
      .catch((err) => {
        console.warn("Could not load from /api/db:", err);
        setIsSynced(true);
      });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          dispatch({ type: "SET_ALL_DATA", payload: parsed });
        } catch {}
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }
  }, []);

  const resetDatabase = () => {
    dispatch({ type: "RESET_TO_DEFAULT" });
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <AppStateContext.Provider
      value={{ state, dispatch, isSynced, resetDatabase }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return ctx;
}
