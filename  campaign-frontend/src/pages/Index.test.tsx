import { render, screen, fireEvent } from "@testing-library/react";
import Index from "./Index";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useToast } from "@/components/ui/use-toast";

jest.mock("@/hooks/useCampaigns");
jest.mock("@/components/ui/use-toast");

describe("Index Page", () => {
  beforeEach(() => {
    (useCampaigns as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: jest.fn(),
    });
  });

  it("renders the page title", () => {
    render(<Index />);
    expect(screen.getByText("Campaign Management")).toBeInTheDocument();
  });

  it("renders the CreateCampaignDialog component", () => {
    render(<Index />);
    expect(screen.getByText("Create Campaign")).toBeInTheDocument();
  });

  it("renders the CampaignList component", () => {
    render(<Index />);
    expect(screen.getByPlaceholderText("Search campaigns...")).toBeInTheDocument();
  });

  it("handles search input", () => {
    render(<Index />);
    const searchInput = screen.getByPlaceholderText("Search campaigns...") as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "test" } });
    expect(searchInput.value).toBe("test");
  });
});
