import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../page";
import "@testing-library/jest-dom";

// Mocks
const mockLogin = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

jest.mock("@/hooks/useSiteConfig", () => ({
  useSiteConfig: () => ({
    config: {
      auth_login_image: "https://example.com/test-image.jpg",
    },
  }),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}));

jest.mock("lucide-react", () => ({
  ArrowLeft: () => <svg data-testid="icon-arrow-left" />,
  Loader2: () => <svg data-testid="icon-loader" />,
  Mail: () => <svg data-testid="icon-mail" />,
  Lock: () => <svg data-testid="icon-lock" />,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form correctly", () => {
    render(<LoginPage />);

    expect(screen.getByPlaceholderText("name@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
  });

  it("handles successful login", async () => {
    mockLogin.mockResolvedValueOnce(true);
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("name@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("displays error message on failure", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("name@example.com"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("disables button while loading", async () => {
    // Make login hang
    mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("name@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "pass" },
    });

    const button = screen.getByRole("button", { name: /Sign In/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByText(/Signing in.../i)).toBeInTheDocument();
  });
});
