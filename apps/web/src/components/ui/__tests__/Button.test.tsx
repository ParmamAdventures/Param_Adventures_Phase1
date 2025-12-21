import React from "react";
import { render, screen } from "@testing-library/react";
import Button from "../Button";

describe("Button", () => {
  it("renders children when not loading", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("shows spinner and is disabled when loading", () => {
    const { container } = render(<Button loading>Save</Button>);
    // spinner is an svg
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    const btn = container.querySelector("button");
    expect(btn).toBeDisabled();
  });
});
