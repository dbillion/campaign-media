import { render, screen, fireEvent } from "@testing-library/react";
import { CampaignList } from "./CampaignList";

describe("CampaignList Component", () => {
  const mockOnStatusChange = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnSearch = jest.fn();
  const mockOnStatusFilter = jest.fn();
  const mockOnPayoutFilter = jest.fn();
  const mockOnSort = jest.fn();

  const campaigns = [
    {
      id: 1,
      title: "Campaign 1",
      landing_url: "https://example1.com",
      is_running: true,
      payouts: [{ id: 1, country: "USA", amount: 100, campaign_id: 1 }],
    },
    {
      id: 2,
      title: "Campaign 2",
      landing_url: "https://example2.com",
      is_running: false,
      payouts: [{ id: 2, country: "CAN", amount: 200, campaign_id: 2 }],
    },
  ];

  beforeEach(() => {
    render(
      <CampaignList
        campaigns={campaigns}
        isLoading={false}
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        searchQuery=""
        statusFilter="all"
        payoutFilter="all"
        sortBy="newest"
        onSearch={mockOnSearch}
        onStatusFilter={mockOnStatusFilter}
        onPayoutFilter={mockOnPayoutFilter}
        onSort={mockOnSort}
      />
    );
  });

  it("renders search bar", () => {
    expect(screen.getByPlaceholderText("Search campaigns...")).toBeInTheDocument();
  });

  it("renders campaign cards", () => {
    expect(screen.getByText("Campaign 1")).toBeInTheDocument();
    expect(screen.getByText("Campaign 2")).toBeInTheDocument();
  });

  it("calls onSearch when typing in search input", () => {
    const searchInput = screen.getByPlaceholderText("Search campaigns...");
    fireEvent.change(searchInput, { target: { value: "test" } });
    expect(mockOnSearch).toHaveBeenCalledWith("test");
  });

  it("calls onStatusFilter when selecting a status", () => {
    const statusSelect = screen.getByText("Status");
    fireEvent.click(statusSelect);
    const allStatusOption = screen.getByText("All Status");
    fireEvent.click(allStatusOption);
    expect(mockOnStatusFilter).toHaveBeenCalledWith("all");
  });

  it("calls onPayoutFilter when selecting a payout range", () => {
    const payoutSelect = screen.getByText("Payout Range");
    fireEvent.click(payoutSelect);
    const allPayoutOption = screen.getByText("All Payouts");
    fireEvent.click(allPayoutOption);
    expect(mockOnPayoutFilter).toHaveBeenCalledWith("all");
  });

  it("calls onSort when selecting a sort criteria", () => {
    const sortSelect = screen.getByText("Sort By");
    fireEvent.click(sortSelect);
    const newestOption = screen.getByText("Newest First");
    fireEvent.click(newestOption);
    expect(mockOnSort).toHaveBeenCalledWith("newest");
  });
});
