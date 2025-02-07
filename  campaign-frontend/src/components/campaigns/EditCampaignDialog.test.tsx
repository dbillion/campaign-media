import { render, screen, fireEvent } from "@testing-library/react";
import { EditCampaignDialog } from "./EditCampaignDialog";
import { useToast } from "@/components/ui/use-toast";

jest.mock("@/components/ui/use-toast", () => ({
  useToast: jest.fn(),
}));

describe("EditCampaignDialog Component", () => {
  const mockOnEdit = jest.fn();
  const mockToast = jest.fn();
  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });

    render(
      <EditCampaignDialog
        campaign={{
          id: 1,
          title: "Test Campaign",
          landing_url: "https://example.com",
          is_running: true,
          payouts: [{ id: 1, campaign_id: 1, country: "USA", amount: 100 }],
        }}
        onEdit={mockOnEdit}
      />
    );
  });

  it("renders edit campaign dialog", () => {
    expect(screen.getByText("Edit Campaign")).toBeInTheDocument();
  });

  it("calls onEdit with valid data", () => {
    const saveButton = screen.getByText("Save Changes");
    fireEvent.click(saveButton);
    expect(mockOnEdit).toHaveBeenCalledWith(1, {
      title: "Test Campaign",
      landing_url: "https://example.com",
    });
  });

  it("shows validation error for empty fields", () => {
    const titleInput = screen.getByPlaceholderText("Campaign title");
    fireEvent.change(titleInput, { target: { value: "" } });
    const saveButton = screen.getByText("Save Changes");
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
    const saveButton = screen.getByText("Save Changes");
    fireEvent.click(saveButton);
    expect(mockToast).toHaveBeenCalledWith({
      title: "Invalid URL",
      description: "Please enter a valid URL (e.g., www.example.com or https://example.com)",
      variant: "destructive",
    });
  });
});
