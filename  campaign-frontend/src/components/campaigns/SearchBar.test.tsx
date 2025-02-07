import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "./SearchBar";
import { jest } from '@jest/globals';

describe("SearchBar Component", () => {
  const mockOnSearch = jest.fn();
  const mockOnStatusFilter = jest.fn();
  const mockOnPayoutFilter = jest.fn();
  const mockOnSortBy = jest.fn();

  beforeEach(() => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        onStatusFilter={mockOnStatusFilter}
        onPayoutFilter={mockOnPayoutFilter}
        onSortBy={mockOnSortBy}
      />
    );
  });

  it("renders search input", () => {
    expect(screen.getByPlaceholderText("Search campaigns...")).toBeInTheDocument();
  });

  it("calls onSearch when typing in search input", () => {
    const searchInput = screen.getByPlaceholderText("Search campaigns...") as HTMLInputElement;
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

  it("calls onSortBy when selecting a sort criteria", () => {
    const sortSelect = screen.getByText("Sort By");
    fireEvent.click(sortSelect);
    const newestOption = screen.getByText("Newest First");
    fireEvent.click(newestOption);
    expect(mockOnSortBy).toHaveBeenCalledWith("newest");
  });
});
