"use client";

import { useActionState, useState } from "react";
import { createSidequest, type CreateSidequestState } from "@/app/actions";
import { VIBE_OPTIONS } from "@/lib/sidequests";

const initialState: CreateSidequestState = {};

export default function CreateForm() {
  const [state, formAction, pending] = useActionState(createSidequest, initialState);
  const [partySize, setPartySize] = useState(2);
  const [preferences, setPreferences] = useState("");

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
        <legend>Set a per-person budget</legend>
        <div className="budget-inputs">
          <label>
            <span>Minimum</span>
            <span className="money-input">
              <b aria-hidden="true">$</b>
              <input type="number" name="budgetMin" min="0" max="500" step="1" defaultValue="15" required />
            </span>
          </label>
          <span className="budget-separator" aria-hidden="true">–</span>
          <label>
            <span>Maximum</span>
            <span className="money-input">
              <b aria-hidden="true">$</b>
              <input type="number" name="budgetMax" min="0" max="500" step="1" defaultValue="40" required />
            </span>
          </label>
        </div>
        <p className="field-hint">Enter what each person is comfortable spending.</p>
      </fieldset>

      <fieldset>
        <legend>How many people are going?</legend>
        <div className="party-size-control">
          <input
            aria-label="Group size slider"
            type="range"
            min="1"
            max="12"
            value={partySize}
            onChange={(event) => setPartySize(Number(event.target.value))}
          />
          <label>
            <span className="sr-only">Number of people</span>
            <input
              type="number"
              name="partySize"
              min="1"
              max="12"
              value={partySize}
              onChange={(event) => {
                const nextValue = Number(event.target.value);
                if (Number.isFinite(nextValue)) setPartySize(Math.min(12, Math.max(1, nextValue)));
              }}
              required
            />
          </label>
          <span>{partySize === 1 ? "person" : "people"}</span>
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

      <div className="form-group">
        <div className="label-row">
          <label htmlFor="preferences">Anything else we should know?</label>
          <span>{preferences.length}/500</span>
        </div>
        <textarea
          id="preferences"
          name="preferences"
          maxLength={500}
          value={preferences}
          onChange={(event) => setPreferences(event.target.value)}
          placeholder="For example: I want activities before or around a Yankees game."
        />
        <p className="field-hint">Optional. Add an occasion, accessibility need, must-do, or anything you want the plan to work around.</p>
      </div>

      {state.error && <p className="form-error" role="alert">{state.error}</p>}

      <button className="primary-button generate-button" type="submit" disabled={pending}>
        {pending ? "Plotting your sidequest…" : "Generate my sidequest"}
      </button>
      <p className="form-footnote">AI ideas can be wrong. Check hours, prices, transit, and accessibility before you go.</p>
    </form>
  );
}
