import React from "react";
import { render, screen } from "@testing-library/react";
import ErrorBlock from "../ErrorBlock";

describe("ErrorBlock", () => {
  it("renders error text", () => {
    render(<ErrorBlock>Something went wrong</ErrorBlock>);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});
