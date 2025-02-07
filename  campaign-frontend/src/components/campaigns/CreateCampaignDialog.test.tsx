import { render, screen, fireEvent } from "@testing-library/react";
import { CreateCampaignDialog } from "./CreateCampaignDialog";
import { useToast } from "@/components/ui/use-toast";
import { jest } from '@jest/globals';

jest.mock("@/components/ui/use-toast");
const mockedUseToast = jest.mocked(useToast);

describe("CreateCampaignDialog Component", () => {
  const mockOnCreateCampaign = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    mockedUseToast.mockReturnValue({
      toast: mockToast,
      dismiss: jest.fn(),
      toasts: []
    } as ReturnType<typeof useToast>);

    render(
      <CreateCampaignDialog
        onCreateCampaign={mockOnCreateCampaign}
      />
    );
  });

  it("renders create campaign dialog", () => {
    expect(screen.getByText("Create Campaign")).toBeInTheDocument();
  });

  it("calls onCreateCampaign with valid data", () => {
    const titleInput = screen.getByPlaceholderText("Campaign title");
    fireEvent.change(titleInput, { target: { value: "New Campaign" } });
    const urlInput = screen.getByPlaceholderText("www.example.com");
    fireEvent.change(urlInput, { target: { value: "https://example.com" } });
    const saveButton = screen.getByText("Create Campaign");
    fireEvent.click(saveButton);
    expect(mockOnCreateCampaign).toHaveBeenCalledWith({
      title: "New Campaign",
      landing_url: "https://example.com",
      is_running: false,
      payouts: [{ country: "", amount: 0 }],
    });
  });

  it("shows validation error for empty fields", () => {
    const saveButton = screen.getByText("Create Campaign");
    fireEvent.click(saveButton);
    expect(mockToast).toHaveBeenCalledWith({
      title: "Validation Error",
      description: "Please fill in all required fields",
      variant: "destructive",
    });
  });

  it("shows validation error for invalid URL", () => {
    const urlInput = screen.getByPlaceholderText("www.example.com");
    fireEvent.change(urlInput, { target: { value: "invalid-url" } });
    const saveButton = screen.getByText("Create Campaign");
    fireEvent.click(saveButton);
    expect(mockToast).toHaveBeenCalledWith({
      title: "Invalid URL",
      description: "Please enter a valid URL (e.g., www.example.com or https://example.com)",
      variant: "destructive",
    });
  });
});
function mockOnCreateCampaign(data: { title: string; landing_url: string; is_running: boolean; payouts: { country: string; amount: number; }[]; }): void {
  throw new Error("Function not implemented.");
}

