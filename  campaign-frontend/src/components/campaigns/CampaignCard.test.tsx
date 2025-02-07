import { render, screen, fireEvent } from "@testing-library/react";
import { CampaignCard } from "./CampaignCard";
import { useToggleCampaignStatus, useUpdateCampaign, useDeleteCampaign } from "@/hooks/useCampaigns";
import { useToast } from "@/components/ui/use-toast";

jest.mock("@/hooks/useCampaigns");
jest.mock("@/components/ui/use-toast");

describe("CampaignCard Component", () => {
  const mockToggleStatus = jest.fn();
  const mockUpdateCampaign = jest.fn();
  const mockDeleteCampaign = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    (useToggleCampaignStatus as jest.Mock).mockReturnValue({ mutate: mockToggleStatus });
    (useUpdateCampaign as jest.Mock).mockReturnValue({ mutate: mockUpdateCampaign });
    (useDeleteCampaign as jest.Mock).mockReturnValue({ mutate: mockDeleteCampaign });
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    render(
      <CampaignCard
        campaign={{
          id: 1,
          title: "Test Campaign",
          landing_url: "https://example.com",
          is_running: true,
          payouts: [{ id: 1, country: "USA", amount: 100, campaign_id: 1 }],
        }}
      />
    );
  });

  it("renders campaign title", () => {
    expect(screen.getByText("Test Campaign")).toBeInTheDocument();
  });

  it("renders campaign URL", () => {
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
  });

  it("renders campaign payouts", () => {
    expect(screen.getByText("US")).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();
  });

  it("calls toggleStatus when switching status", () => {
    const switchButton = screen.getByRole("switch");
    fireEvent.click(switchButton);
    expect(mockToggleStatus).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it("calls deleteCampaign when clicking delete button", () => {
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);
    const confirmButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(confirmButton);
    expect(mockDeleteCampaign).toHaveBeenCalledWith(1, expect.any(Object));
  });
});
