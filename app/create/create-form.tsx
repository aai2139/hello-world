"use client";

import { useActionState } from "react";
import { createSidequest, type CreateSidequestState } from "@/app/actions";
import { BUDGET_OPTIONS, VIBE_OPTIONS } from "@/lib/sidequests";

const initialState: CreateSidequestState = {};

export default function CreateForm() {
  const [state, formAction, pending] = useActionState(createSidequest, initialState);

  return (
    <form action={formAction} className="create-form">
      <div className="form-group">
        <label htmlFor="neighborhood">Where are you heading?</label>
        <input
          id="neighborhood"
          name="neighborhood"
          minLength={2}
          maxLength={60}
          required
          placeholder="Try Jackson Heights, DUMBO, or the Upper West Side"
          autoComplete="off"
        />
        <p className="field-hint">A neighborhood, park, campus area, or subway stop works.</p>
      </div>

      <fieldset>
        <legend>Pick a total budget</legend>
        <div className="choice-grid three-columns">
          {BUDGET_OPTIONS.map((option, index) => (
            <label className="radio-card" key={option.value}>
              <input
                type="radio"
                name="budget"
                value={option.value}
                defaultChecked={index === 0}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Choose the energy</legend>
        <div className="choice-grid">
          {VIBE_OPTIONS.map((option, index) => (
            <label className="radio-card" key={option.value}>
              <input
                type="radio"
                name="vibe"
                value={option.value}
                defaultChecked={index === 4}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {state.error && <p className="form-error" role="alert">{state.error}</p>}

      <button className="primary-button generate-button" type="submit" disabled={pending}>
        {pending ? "Plotting your sidequest…" : "Generate my sidequest"}
      </button>
      <p className="form-footnote">AI ideas can be wrong. Check hours, prices, transit, and accessibility before you go.</p>
    </form>
  );
}
