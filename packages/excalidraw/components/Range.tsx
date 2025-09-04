import React, { useEffect } from "react";

import "./Range.scss";

import type { AppClassProperties, AppState } from "../types";
import type { ExcalidrawElement } from "@excalidraw/element/types";

export type RangeProps = {
  updateData: (value: number) => void;
  app: AppClassProperties;
  label: string;
  property: "opacity" | "strokeWidth";
  min?: number;
  max?: number;
  step?: number;
  testId?: string;
};

export const Range = ({
  updateData,
  app,
  label,
  property,
  min = 0,
  max = 100,
  step = 10,
  testId,
}: RangeProps) => {
  const rangeRef = React.useRef<HTMLInputElement>(null);
  const valueRef = React.useRef<HTMLDivElement>(null);
  const selectedElements = app.scene.getSelectedElements(app.state);
  let hasCommonValue = true;
  const firstElement = selectedElements.at(0);

  const getProperty = (element: ExcalidrawElement) => {
    return property === "strokeWidth"
      ? element.strokeWidth
      : (element as any)[property];
  };

  const getAppState = (appState: AppState) => {
    return property === "strokeWidth"
      ? appState.currentItemStrokeWidth
      : (appState as any)[`currentItem${property.charAt(0).toUpperCase()}${property.slice(1)}`];
  };

  const leastCommonValue = selectedElements.reduce((acc, element) => {
    const val = getProperty(element);
    if (acc != null && acc !== val) {
      hasCommonValue = false;
    }
    if (acc == null || acc > val) {
      return val;
    }
    return acc;
  }, (firstElement ? getProperty(firstElement) : null) as number | null);

  const value = leastCommonValue ?? getAppState(app.state);

  useEffect(() => {
    if (rangeRef.current && valueRef.current) {
      const rangeElement = rangeRef.current;
      const valueElement = valueRef.current;
      const inputWidth = rangeElement.offsetWidth;
      const thumbWidth = 15; // 15 is the width of the thumb
      const percentage = (value - min) / (max - min);
      const position =
        percentage * (inputWidth - thumbWidth) + thumbWidth / 2;
      valueElement.style.left = `${position}px`;
      rangeElement.style.background = `linear-gradient(to right, var(--color-slider-track) 0%, var(--color-slider-track) ${percentage * 100}%, var(--button-bg) ${percentage * 100}%, var(--button-bg) 100%)`;
    }
  }, [value, min, max]);

  return (
    <label className="control-label">
      {label}
      <div className="range-wrapper">
        <input
          style={{
            ["--color-slider-track" as string]: hasCommonValue
              ? undefined
              : "var(--button-bg)",
          }}
          ref={rangeRef}
          type="range"
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            updateData(+event.target.value);
          }}
          value={value}
          className="range-input"
          data-testid={testId}
        />
        <div className="value-bubble" ref={valueRef}>
          {value !== 0 ? value : null}
        </div>
        <div className="zero-label">{min}</div>
      </div>
    </label>
  );
};
