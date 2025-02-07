import { render, screen, fireEvent } from "@testing-library/react";
import { PayoutInput } from "./PayoutInput";
import { useCountries } from "@/hooks/useCountries";

jest.mock("@/hooks/useCountries");

describe("PayoutInput Component", () => {
  const mockOnUpdate = jest.fn();
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    (useCountries as jest.Mock).mockReturnValue({
      data: [{ code: "US", name: "United States" }],
    });

    render(
      <PayoutInput
        payout={{ country: "US", amount: 100 }}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );
  });

  it("renders country select", () => {
    expect(screen.getByText("Select country")).toBeInTheDocument();
  });

  it("renders amount input", () => {
    expect(screen.getByPlaceholderText("Amount")).toBeInTheDocument();
  });

  it("calls onUpdate when changing country", () => {
    const countrySelect = screen.getByText("Select country");
    fireEvent.click(countrySelect);
    const countryOption = screen.getByText("United States");
    fireEvent.click(countryOption);
    expect(mockOnUpdate).toHaveBeenCalledWith({ country: "US", amount: 100 });
  });

  it("calls onUpdate when changing amount", () => {
    const amountInput = screen.getByPlaceholderText("Amount");
    fireEvent.change(amountInput, { target: { value: "200" } });
    expect(mockOnUpdate).toHaveBeenCalledWith({ country: "US", amount: 200 });
  });

  it("calls onRemove when clicking remove button", () => {
    const removeButton = screen.getByRole("button");
    fireEvent.click(removeButton);
    expect(mockOnRemove).toHaveBeenCalled();
  });
});
